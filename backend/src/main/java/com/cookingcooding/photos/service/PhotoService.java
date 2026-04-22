package com.cookingcooding.photos.service;

import com.cookingcooding.photos.dto.PhotoResponse;
import com.cookingcooding.photos.entity.Photo;
import com.cookingcooding.photos.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.service-key:}")
    private String serviceKey;

    @Value("${supabase.bucket:photos}")
    private String bucket;

    private final PhotoRepository photoRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<PhotoResponse> getAll() {
        return photoRepository.findAllByOrderByUploadedAtDesc().stream()
                .map(PhotoResponse::from)
                .toList();
    }

    public PhotoResponse upload(MultipartFile file, String uploaderEmail) throws IOException {
        String ext = getExtension(file.getOriginalFilename());
        String storagePath = UUID.randomUUID() + "." + ext;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + storagePath;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        headers.setContentType(MediaType.parseMediaType(
                file.getContentType() != null ? file.getContentType() : "application/octet-stream"
        ));

        HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
        restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

        String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + storagePath;

        Photo photo = Photo.builder()
                .fileName(file.getOriginalFilename())
                .publicUrl(publicUrl)
                .storagePath(storagePath)
                .uploadedBy(uploaderEmail)
                .uploadedAt(LocalDateTime.now())
                .build();

        return PhotoResponse.from(photoRepository.save(photo));
    }

    public void delete(Long id) {
        Photo photo = photoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Photo not found"));

        String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + photo.getStoragePath();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + serviceKey);
        restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(headers), String.class);

        photoRepository.delete(photo);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
