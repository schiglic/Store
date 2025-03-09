package com.example.backendstore.entity.controller;

import com.example.backendstore.entity.Product;
import com.example.backendstore.entity.repository.ProductRepository;
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
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Value("${upload.path}")
    private String uploadPath;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.isPresent() ? ResponseEntity.ok(product.get()) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public Product createProduct(
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam("image") MultipartFile image) throws IOException {
        // Зберігаємо зображення на сервер
        String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
        Path filePath = Paths.get(uploadPath + fileName);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, image.getBytes());

        // Створюємо продукт із шляхом до зображення
        Product product = new Product();
        product.setName(name);
        product.setPrice(price);
        product.setDescription(description);
        product.setImageUrl("/uploads/" + fileName); // Шлях для API
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            product.setName(name);
            product.setPrice(price);
            product.setDescription(description);
            if (image != null && !image.isEmpty()) {
                // Видаляємо старе зображення, якщо є
                if (product.getImageUrl() != null) {
                    Path oldFilePath = Paths.get(uploadPath + product.getImageUrl().replace("/uploads/", ""));
                    Files.deleteIfExists(oldFilePath);
                }
                // Зберігаємо нове зображення
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path filePath = Paths.get(uploadPath + fileName);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, image.getBytes());
                product.setImageUrl("/uploads/" + fileName);
            }
            return ResponseEntity.ok(productRepository.save(product));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) throws IOException {
        Optional<Product> product = productRepository.findById(id);
        if (product.isPresent()) {
            if (product.get().getImageUrl() != null) {
                Path filePath = Paths.get(uploadPath + product.get().getImageUrl().replace("/uploads/", ""));
                Files.deleteIfExists(filePath);
            }
            productRepository.delete(product.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}