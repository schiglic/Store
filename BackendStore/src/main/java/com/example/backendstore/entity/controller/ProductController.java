package com.example.backendstore.entity.controller;

import com.example.backendstore.entity.Product;
import com.example.backendstore.entity.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

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
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam("image") MultipartFile image) {
        try {
            // Створюємо унікальну назву файлу з розширенням .jpg
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename().replace(".", "_") + ".jpg";
            Path filePath = Paths.get(uploadPath + fileName);

            // Перевіряємо директорію і створюємо, якщо її немає
            if (!Files.exists(filePath.getParent())) {
                Files.createDirectories(filePath.getParent());
            }

            // Конвертуємо та оптимізуємо зображення в JPEG
            if (image != null && !image.isEmpty()) {
                byte[] imageBytes = image.getBytes();
                BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

                if (originalImage == null) {
                    logger.error("Не вдалося прочитати зображення: формат не підтримується");
                    return ResponseEntity.badRequest().body("Не вдалося прочитати зображення: формат не підтримується");
                }

                // Зміна розміру до 800x800
                int width = Math.min(originalImage.getWidth(), 800);
                int height = Math.min(originalImage.getHeight(), 800);
                BufferedImage resizedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                Graphics2D g2d = resizedImage.createGraphics();
                g2d.drawImage(originalImage.getScaledInstance(width, height, java.awt.Image.SCALE_SMOOTH), 0, 0, null);
                g2d.dispose();

                // Збереження як JPEG
                File outputFile = new File(filePath.toString());
                ImageIO.write(resizedImage, "jpg", outputFile);
            } else {
                logger.error("Завантажене зображення пусте або null");
                return ResponseEntity.badRequest().body("Зображення не завантажено");
            }

            // Створюємо продукт із шляхом до зображення
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setDescription(description);
            product.setImageUrl("/uploads/" + fileName);
            return ResponseEntity.ok(productRepository.save(product));
        } catch (IOException e) {
            logger.error("Помилка при обробці зображення: ", e);
            return ResponseEntity.badRequest().body("Не вдалося обробити зображення: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") Double price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            Optional<Product> productOptional = productRepository.findById(id);
            if (productOptional.isPresent()) {
                Product product = productOptional.get();
                product.setName(name);
                product.setPrice(price);
                product.setDescription(description);
                if (image != null && !image.isEmpty()) {
                    if (product.getImageUrl() != null) {
                        Path oldFilePath = Paths.get(uploadPath + product.getImageUrl().replace("/uploads/", ""));
                        Files.deleteIfExists(oldFilePath);
                    }
                    String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename().replace(".", "_") + ".jpg";
                    Path filePath = Paths.get(uploadPath + fileName);
                    Files.createDirectories(filePath.getParent());

                    byte[] imageBytes = image.getBytes();
                    BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));

                    if (originalImage == null) {
                        logger.error("Не вдалося прочитати зображення: формат не підтримується");
                        return ResponseEntity.badRequest().body("Не вдалося прочитати зображення: формат не підтримується");
                    }

                    int width = Math.min(originalImage.getWidth(), 800);
                    int height = Math.min(originalImage.getHeight(), 800);
                    BufferedImage resizedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
                    Graphics2D g2d = resizedImage.createGraphics();
                    g2d.drawImage(originalImage.getScaledInstance(width, height, java.awt.Image.SCALE_SMOOTH), 0, 0, null);
                    g2d.dispose();

                    File outputFile = new File(filePath.toString());
                    ImageIO.write(resizedImage, "jpg", outputFile);

                    product.setImageUrl("/uploads/" + fileName);
                }
                return ResponseEntity.ok(productRepository.save(product));
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            logger.error("Помилка при обробці зображення: ", e);
            return ResponseEntity.badRequest().body("Не вдалося обробити зображення: " + e.getMessage());
        }
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