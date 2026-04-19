package com.cookingkooding.files.controller;

import com.cookingkooding.files.entity.BlockedExtension;
import com.cookingkooding.files.entity.UploadedFile;
import com.cookingkooding.files.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping
    public ResponseEntity<List<UploadedFile>> getFiles() {
        return ResponseEntity.ok(fileService.getFiles());
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadedFile> upload(@RequestParam("file") MultipartFile file)
            throws IOException {
        return ResponseEntity.ok(fileService.upload(file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        fileService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll() throws IOException {
        fileService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/extensions")
    public ResponseEntity<List<BlockedExtension>> getExtensions() {
        return ResponseEntity.ok(fileService.getExtensions());
    }

    @PostMapping("/extensions")
    public ResponseEntity<BlockedExtension> addExtension(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(fileService.addExtension(body.get("extension")));
    }

    @DeleteMapping("/extensions/{ext}")
    public ResponseEntity<Void> removeExtension(@PathVariable String ext) {
        fileService.removeExtension(ext);
        return ResponseEntity.noContent().build();
    }
}
