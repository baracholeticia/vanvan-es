package com.vanvan.service;

import com.vanvan.dto.VehicleResponseDTO;
import com.vanvan.exception.*;
import com.vanvan.model.Driver;
import com.vanvan.model.Vehicle;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class VehicleServiceTest {

    private VehicleRepository vehicleRepository;
    private DriverRepository driverRepository;
    private FileStorageService fileStorageService;
    private VehicleService vehicleService;

    private Driver driver;
    private UUID driverId;
    private Vehicle vehicle;
    private UUID vehicleId;

    @BeforeEach
    void setUp() {
        vehicleRepository = mock(VehicleRepository.class);
        driverRepository = mock(DriverRepository.class);
        fileStorageService = mock(FileStorageService.class);
        vehicleService = new VehicleService(vehicleRepository, driverRepository, fileStorageService);

        driverId = UUID.randomUUID();
        driver = new Driver();
        driver.setName("João");

        vehicleId = UUID.randomUUID();
        vehicle = new Vehicle("Sprinter", "ABC1D23", "vehicles/documents/doc.pdf", null, driver);
    }

    // createVehicle

    @Test
    void createVehicle_success_withoutPhoto() throws IOException {
        MockMultipartFile document = pdfFile("doc.pdf");

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);
        when(fileStorageService.storeFile(document, "vehicles/documents"))
                .thenReturn("vehicles/documents/uuid.pdf");
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        VehicleResponseDTO result = vehicleService.createVehicle(
                driverId, "Sprinter", "ABC1D23", document, null);

        assertNotNull(result);
        verify(vehicleRepository).save(any(Vehicle.class));
        verify(fileStorageService, never()).storeFile(any(), eq("vehicles/photos"));
    }

    @Test
    void createVehicle_success_withPhoto() throws IOException {
        MockMultipartFile document = pdfFile("doc.pdf");
        MockMultipartFile photo = imageFile("foto.jpg", "image/jpeg");

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);
        when(fileStorageService.storeFile(document, "vehicles/documents"))
                .thenReturn("vehicles/documents/uuid.pdf");
        when(fileStorageService.storeFile(photo, "vehicles/photos"))
                .thenReturn("vehicles/photos/uuid.jpg");

        Vehicle vehicleWithPhoto = new Vehicle("Sprinter", "ABC1D23",
                "vehicles/documents/uuid.pdf", "vehicles/photos/uuid.jpg", driver);
        when(vehicleRepository.save(any())).thenReturn(vehicleWithPhoto);

        VehicleResponseDTO result = vehicleService.createVehicle(
                driverId, "Sprinter", "ABC1D23", document, photo);

        assertNotNull(result);
        verify(fileStorageService).storeFile(photo, "vehicles/photos");
    }

    @Test
    void createVehicle_driverNotFound_throws() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", pdfFile("doc.pdf"), null));
    }

    @Test
    void createVehicle_invalidPlate_throws() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));

        assertThrows(InvalidLicensePlateException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "INVALIDA", pdfFile("doc.pdf"), null));
    }

    @Test
    void createVehicle_nullPlate_throws() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));

        assertThrows(InvalidLicensePlateException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", null, pdfFile("doc.pdf"), null));
    }

    @Test
    void createVehicle_plateAlreadyExists_throws() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(true);

        assertThrows(LicensePlateAlreadyExistsException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", pdfFile("doc.pdf"), null));
    }

    @Test
    void createVehicle_nullDocument_throws() {
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);

        assertThrows(DocumentRequiredException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", null, null));
    }

    @Test
    void createVehicle_emptyDocument_throws() {
        MockMultipartFile emptyDoc = new MockMultipartFile(
                "document", "doc.pdf", "application/pdf", new byte[0]);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);

        assertThrows(DocumentRequiredException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", emptyDoc, null));
    }

    @Test
    void createVehicle_documentWrongType_throws() {
        MockMultipartFile wrongType = new MockMultipartFile(
                "document", "doc.png", "image/png", "dados".getBytes());

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);

        assertThrows(InvalidDocumentTypeException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", wrongType, null));
    }

    @Test
    void createVehicle_documentTooLarge_throws() {
        byte[] bigContent = new byte[11 * 1024 * 1024]; // 11MB
        MockMultipartFile bigDoc = new MockMultipartFile(
                "document", "grande.pdf", "application/pdf", bigContent);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);

        assertThrows(FileSizeExceededException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", bigDoc, null));
    }

    @Test
    void createVehicle_photoWrongType_throws() throws IOException {
        MockMultipartFile document = pdfFile("doc.pdf");
        MockMultipartFile wrongPhoto = new MockMultipartFile(
                "photo", "foto.pdf", "application/pdf", "dados".getBytes());

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);
        when(fileStorageService.storeFile(document, "vehicles/documents"))
                .thenReturn("vehicles/documents/uuid.pdf");

        assertThrows(InvalidImageTypeException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", document, wrongPhoto));
    }

    @Test
    void createVehicle_photoTooLarge_throws() throws IOException {
        MockMultipartFile document = pdfFile("doc.pdf");
        byte[] bigContent = new byte[11 * 1024 * 1024];
        MockMultipartFile bigPhoto = new MockMultipartFile(
                "photo", "foto.jpg", "image/jpeg", bigContent);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(driver));
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);
        when(fileStorageService.storeFile(document, "vehicles/documents"))
                .thenReturn("vehicles/documents/uuid.pdf");

        assertThrows(FileSizeExceededException.class, () ->
                vehicleService.createVehicle(driverId, "Sprinter", "ABC1D23", document, bigPhoto));
    }

    // getVehiclesByDriver

    @Test
    void getVehiclesByDriver_returnsList() {
        when(vehicleRepository.findByDriverId(driverId)).thenReturn(List.of(vehicle));

        List<VehicleResponseDTO> result = vehicleService.getVehiclesByDriver(driverId);

        assertEquals(1, result.size());
        assertEquals("Sprinter", result.getFirst().getModelName());
    }

    @Test
    void getVehiclesByDriver_emptyList() {
        when(vehicleRepository.findByDriverId(driverId)).thenReturn(List.of());

        List<VehicleResponseDTO> result = vehicleService.getVehiclesByDriver(driverId);

        assertTrue(result.isEmpty());
    }

    // getVehicleById

    @Test
    void getVehicleById_success() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        VehicleResponseDTO result = vehicleService.getVehicleById(vehicleId);

        assertNotNull(result);
        assertEquals("ABC1D23", result.getLicensePlate());
    }

    @Test
    void getVehicleById_notFound_throws() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class,
                () -> vehicleService.getVehicleById(vehicleId));
    }

    // getAllVehicles

    @Test
    void getAllVehicles_returnsList() {
        when(vehicleRepository.findAll()).thenReturn(List.of(vehicle));

        List<VehicleResponseDTO> result = vehicleService.getAllVehicles();

        assertEquals(1, result.size());
    }

    // updateVehicle 

    @Test
    void updateVehicle_updatesModelName() throws IOException {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        vehicleService.updateVehicle(
                vehicleId, "Nova Sprinter", null, null, null);

        assertEquals("Nova Sprinter", vehicle.getModelName());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void updateVehicle_updatesLicensePlate() throws IOException {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.existsByLicensePlate("XYZ1A23")).thenReturn(false);
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        vehicleService.updateVehicle(vehicleId, null, "XYZ1A23", null, null);

        assertEquals("XYZ1A23", vehicle.getLicensePlate());
    }

    @Test
    void updateVehicle_samePlate_doesNotCheckDuplicate() throws IOException {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        // mesma placa que já está no veículo, não deve lançar exceção
        vehicleService.updateVehicle(vehicleId, null, "ABC1D23", null, null);

        verify(vehicleRepository, never()).existsByLicensePlate(anyString());
    }

    @Test
    void updateVehicle_newPlateTaken_throws() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.existsByLicensePlate("XYZ1A23")).thenReturn(true);

        assertThrows(LicensePlateAlreadyExistsException.class, () ->
                vehicleService.updateVehicle(vehicleId, null, "XYZ1A23", null, null));
    }

    @Test
    void updateVehicle_notFound_throws() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class, () ->
                vehicleService.updateVehicle(vehicleId, "Model", null, null, null));
    }

    @Test
    void updateVehicle_updatesDocument() throws IOException {
        MockMultipartFile newDoc = pdfFile("novo.pdf");

        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(fileStorageService.storeFile(newDoc, "vehicles/documents"))
                .thenReturn("vehicles/documents/novo.pdf");
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        vehicleService.updateVehicle(vehicleId, null, null, newDoc, null);

        verify(fileStorageService).deleteFile("vehicles/documents/doc.pdf");
        verify(fileStorageService).storeFile(newDoc, "vehicles/documents");
    }

    @Test
    void updateVehicle_updatesPhoto() throws IOException {
        MockMultipartFile photo = imageFile("nova.jpg", "image/jpeg");

        // veículo sem foto anterior
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(fileStorageService.storeFile(photo, "vehicles/photos"))
                .thenReturn("vehicles/photos/nova.jpg");
        when(vehicleRepository.save(any())).thenReturn(vehicle);

        vehicleService.updateVehicle(vehicleId, null, null, null, photo);

        verify(fileStorageService).storeFile(photo, "vehicles/photos");
    }

    // deleteVehicle
    @Test
    void deleteVehicle_success_withoutPhoto() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(vehicleId);

        verify(fileStorageService).deleteFile("vehicles/documents/doc.pdf");
        verify(fileStorageService, never()).deleteFile(contains("photos"));
        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteVehicle_success_withPhoto() {
        vehicle.setPhotoPath("vehicles/photos/foto.jpg");
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(vehicleId);

        verify(fileStorageService).deleteFile("vehicles/documents/doc.pdf");
        verify(fileStorageService).deleteFile("vehicles/photos/foto.jpg");
        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteVehicle_notFound_throws() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class,
                () -> vehicleService.deleteVehicle(vehicleId));
    }

    // getVehicleDocument
    @Test
    void getVehicleDocument_success() throws IOException {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(fileStorageService.loadFile("vehicles/documents/doc.pdf"))
                .thenReturn("pdf content".getBytes());

        byte[] result = vehicleService.getVehicleDocument(vehicleId);

        assertArrayEquals("pdf content".getBytes(), result);
    }

    @Test
    void getVehicleDocument_notFound_throws() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class,
                () -> vehicleService.getVehicleDocument(vehicleId));
    }

    // getVehiclePhoto

    @Test
    void getVehiclePhoto_success() throws IOException {
        vehicle.setPhotoPath("vehicles/photos/foto.jpg");
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(fileStorageService.loadFile("vehicles/photos/foto.jpg"))
                .thenReturn("image bytes".getBytes());

        byte[] result = vehicleService.getVehiclePhoto(vehicleId);

        assertArrayEquals("image bytes".getBytes(), result);
    }

    @Test
    void getVehiclePhoto_noPhoto_throws() {
        // vehicle.photoPath == null
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        assertThrows(VehiclePhotoNotFoundException.class,
                () -> vehicleService.getVehiclePhoto(vehicleId));
    }

    @Test
    void getVehiclePhoto_vehicleNotFound_throws() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class,
                () -> vehicleService.getVehiclePhoto(vehicleId));
    }

    // isLicensePlateTaken

    @Test
    void isLicensePlateTaken_true() {
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(true);

        assertTrue(vehicleService.isLicensePlateTaken("ABC1D23"));
    }

    @Test
    void isLicensePlateTaken_false() {
        when(vehicleRepository.existsByLicensePlate("ABC1D23")).thenReturn(false);

        assertFalse(vehicleService.isLicensePlateTaken("ABC1D23"));
    }

    @Test
    void isLicensePlateTaken_invalidPlate_throws() {
        assertThrows(InvalidLicensePlateException.class,
                () -> vehicleService.isLicensePlateTaken("INVALIDA"));
    }

    // helpers

    private MockMultipartFile pdfFile(String filename) {
        return new MockMultipartFile(
                "document", filename, "application/pdf", "conteudo pdf".getBytes());
    }

    private MockMultipartFile imageFile(String filename, String contentType) {
        return new MockMultipartFile(
                "photo", filename, contentType, "conteudo imagem".getBytes());
    }
}