package com.example.backendstore.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Порожній конструктор
    public Category() {}

    // Конструктор з параметрами
    public Category(String name) {
        this.name = name;
    }

    // Геттери і сеттери
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}