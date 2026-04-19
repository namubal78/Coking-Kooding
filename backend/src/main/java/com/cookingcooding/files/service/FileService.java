package com.cookingcooding.files.service;

import com.cookingcooding.files.entity.BlockedExtension;
import com.cookingcooding.files.entity.UploadedFile;
import com.cookingcooding.files.repository.BlockedExtensionRepository;
import com.cookingcooding.files.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final UploadedFileRepository fileRepository;
    private final BlockedExtensionRepository extensionRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<UploadedFile> getFiles() {
        return fileRepository.findAllByOrderByUploadedAtDesc();
    }

    public UploadedFile upload(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        String ext = getExtension(originalName);

        if (extensionRepository.existsByExtension(ext)) {
            throw new IllegalArgumentException("업로드가 차단된 확장자입니다: " + ext);
        }

        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String storedName = UUID.randomUUID() + "." + ext;
        Path filePath = dir.resolve(storedName);
        Files.write(filePath, file.getBytes());

        return fileRepository.save(UploadedFile.builder()
                .originalName(originalName)
                .storedName(storedName)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .extension(ext)
                .build());
    }

    public void delete(Long id) throws IOException {
        UploadedFile f = fileRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
        Files.deleteIfExists(Paths.get(f.getFilePath()));
        fileRepository.delete(f);
    }

    public void deleteAll() throws IOException {
        for (UploadedFile f : fileRepository.findAll()) {
            Files.deleteIfExists(Paths.get(f.getFilePath()));
        }
        fileRepository.deleteAll();
    }

    public List<BlockedExtension> getExtensions() {
        return extensionRepository.findAll();
    }

    public BlockedExtension addExtension(String ext) {
        if (extensionRepository.existsByExtension(ext)) {
            throw new IllegalArgumentException("이미 차단된 확장자입니다.");
        }
        return extensionRepository.save(BlockedExtension.builder()
                .extension(ext.toLowerCase()).isFixed(false).build());
    }

    public void removeExtension(String ext) {
        BlockedExtension be = extensionRepository.findByExtension(ext)
                .orElseThrow(() -> new IllegalArgumentException("등록되지 않은 확장자입니다."));
        if (be.isFixed()) throw new IllegalArgumentException("고정 확장자는 삭제할 수 없습니다.");
        extensionRepository.delete(be);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
