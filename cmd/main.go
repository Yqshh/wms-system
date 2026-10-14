package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"wms-system/internal/database"
)

type Nomenclature struct {
	ID   int    `json:"id"`
	SKU  string `json:"sku"`
	Name string `json:"name"`
	Unit string `json:"unit"`
}

func main() {
	log.Println("Starting WMS-System...")

	dbPool, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	mux := http.NewServeMux()

	// API: Получить список номенклатуры
	mux.HandleFunc("GET /api/nomenclature", func(w http.ResponseWriter, r *http.Request) {
		rows, err := dbPool.Query(context.Background(), "SELECT id, sku, name, unit FROM nomenclature ORDER BY id DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var items []Nomenclature
		for rows.Next() {
			var item Nomenclature
			if err := rows.Scan(&item.ID, &item.SKU, &item.Name, &item.Unit); err != nil {
				continue
			}
			items = append(items, item)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(items)
	})

	// API: Создать номенклатуру
	mux.HandleFunc("POST /api/nomenclature", func(w http.ResponseWriter, r *http.Request) {
		var item Nomenclature
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		err := dbPool.QueryRow(
			context.Background(),
			"INSERT INTO nomenclature (sku, name, unit) VALUES ($1, $2, $3) RETURNING id",
			item.SKU, item.Name, item.Unit,
		).Scan(&item.ID)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(item)
	})

	// Раздача фронтенда (React + Vite SPA)
	staticDir := "./web/dist"
	if _, err := os.Stat(staticDir); os.IsNotExist(err) {
		log.Printf("WARNING: Static directory '%s' not found! Frontend will not be served.", staticDir)
	}

	fileServer := http.FileServer(http.Dir(staticDir))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Пути, начинающиеся с /api/, не должны попадать на фронтенд-роутер
		if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
			http.NotFound(w, r)
			return
		}

		// Проверяем, существует ли запрашиваемый статический файл (картинка, js, css)
		path := filepath.Join(staticDir, r.URL.Path)
		if _, err := os.Stat(path); err == nil {
			fileServer.ServeHTTP(w, r)
			return
		}

		// Иначе отдаем index.html для работы роутинга на фронтенде
		http.ServeFile(w, r, filepath.Join(staticDir, "index.html"))
	})

	port := ":8080"
	log.Printf("Server is listening on port %s...", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
