package com.example.backendstore.entity.controller;

import com.example.backendstore.entity.Category;
import com.example.backendstore.entity.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Value("${upload.path}")
    private String uploadPath;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        return category.isPresent() ? ResponseEntity.ok(category.get()) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Category createCategory(
            @RequestParam("name") String name,
            @RequestParam("image") MultipartFile image) throws IOException {
        // Зберігаємо зображення на сервер
        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = Paths.get(uploadPath + fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, image.getBytes());

        // Створюємо категорію із шляхом до зображення
        Category category = new Category(name, "/uploads/" + fileName);
        return categoryRepository.save(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        Optional<Category> categoryOptional = categoryRepository.findById(id);
        if (categoryOptional.isPresent()) {
            Category category = categoryOptional.get();
            category.setName(name);
            if (image != null && !image.isEmpty()) {
                if (category.getImageUrl() != null) {
                    Path oldFilePath = Paths.get(uploadPath + category.getImageUrl().replace("/uploads/", ""));
                    Files.deleteIfExists(oldFilePath);
                }
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadPath + fileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, image.getBytes());
                category.setImageUrl("/uploads/" + fileName);
            }
            return ResponseEntity.ok(categoryRepository.save(category));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) throws IOException {
        Optional<Category> category = categoryRepository.findById(id);
        if (category.isPresent()) {
            if (category.get().getImageUrl() != null) {
                Path filePath = Paths.get(uploadPath + category.get().getImageUrl().replace("/uploads/", ""));
                Files.deleteIfExists(filePath);
            }
            categoryRepository.delete(category.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}