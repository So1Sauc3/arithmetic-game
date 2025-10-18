package main

import (
	"log"
	"net/http"
)

func serve() {
	mux := routes()
	log.Println("listening and serving on 0.0.0.0:8080")
	http.ListenAndServe("0.0.0.0:8080", mux)
}

func routes() *http.ServeMux {
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.Dir("../frontend/dist/"))
	mux.Handle("/", fileServer)

	hub := NewHub()
	go hub.Run()

	mux.HandleFunc("/ws", hub.ServeWs)

	return mux
}

