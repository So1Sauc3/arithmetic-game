package main

import (
	"log"
	"net/http"
	"os"
)

func serve() {
	mux := routes()
	log.Println("listening and serving on 0.0.0.0:8080")
	http.ListenAndServe("0.0.0.0:8080", mux)
}

func routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := "../frontend/dist" + r.URL.Path
		if _, err := os.Stat(path); os.IsNotExist(err) || r.URL.Path == "/" {
			http.ServeFile(w, r, "../frontend/dist/index.html")
			return
		}
		http.FileServer(http.Dir("../frontend/dist")).ServeHTTP(w, r)
	}))

	hub := NewHub()
	go hub.Run()

	mux.HandleFunc("/ws", hub.ServeWs)

	return mux
}
