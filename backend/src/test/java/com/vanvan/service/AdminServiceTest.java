package com.vanvan.service;

import com.vanvan.dto.DriverAdminResponseDTO;
import com.vanvan.dto.DriverStatusUpdateDTO;
import com.vanvan.dto.DriverUpdateDTO;
import com.vanvan.enums.RegistrationStatus;
import com.vanvan.exception.UserNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.User;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private DriverRepository driverRepository;
    @Mock private UserRepository userRepository;
    @Mock private PassengerRepository passengerRepository;

    @InjectMocks private AdminService adminService;

    // listDrivers

    @Test
    @DisplayName("Deve barrar rejeição sem motivo")
    void testeRejeicaoSemMotivo() {
        UUID id = UUID.randomUUID();
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.REJECTED, null);
        Driver driver = new Driver("Melissa Pessoa", "12345678901", "87999999999",
                "melissa@ufape.edu.br", "senha123", "123456789",
                "pix-da-mel", LocalDate.of(2000, 1, 1));
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        assertThrows(IllegalArgumentException.class, () -> adminService.updateDriverStatus(id, dto));
    }

    @Test
    @DisplayName("Deve aprovar um motorista com sucesso")
    void deveAprovarMotoristaComSucesso() {
        UUID id = UUID.randomUUID();
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.APPROVED, null);
        Driver driver = new Driver("Melissa Pessoa", "12345678901", "87999999999",
                "melissa@ufape.edu.br", "senha123", "123456789",
                "pix-da-mel", LocalDate.of(2000, 1, 1));
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any(Driver.class))).thenReturn(driver);
        DriverAdminResponseDTO resultado = adminService.updateDriverStatus(id, dto);
        assertNotNull(resultado);
        assertEquals(RegistrationStatus.APPROVED, driver.getRegistrationStatus());
        verify(driverRepository, times(1)).save(driver);
    }

    @Test
    @DisplayName("Deve permitir transição de REJECTED para APPROVED")
    void devePermitirTransicaoDeRejeitadoParaAprovado() {
        UUID driverId = UUID.randomUUID();
        Driver motorista = new Driver();
        motorista.setId(driverId);
        motorista.setRegistrationStatus(RegistrationStatus.REJECTED);
        motorista.setRejectionReason("Documento ilegível");
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.APPROVED, null);
        when(driverRepository.findById(driverId)).thenReturn(Optional.of(motorista));
        when(driverRepository.save(any(Driver.class))).thenAnswer(i -> i.getArgument(0));
        adminService.updateDriverStatus(driverId, dto);
        assertEquals(RegistrationStatus.APPROVED, motorista.getRegistrationStatus());
        assertNull(motorista.getRejectionReason());
        verify(driverRepository, times(1)).save(motorista);
    }

    @Test
    @DisplayName("Deve deletar um motorista com sucesso")
    void deveDeletarMotoristaComSucesso() {
        UUID id = UUID.randomUUID();
        Driver driver = new Driver();
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        adminService.deleteDriver(id);
        verify(driverRepository, times(1)).delete(driver);
    }

    @Test
    @DisplayName("Deve lançar exceção quando motorista não existir")
    void deveLancarExcecaoQuandoMotoristaNaoExistir() {
        UUID idInexistente = UUID.randomUUID();
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.APPROVED, null);
        when(driverRepository.findById(idInexistente)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> adminService.updateDriverStatus(idInexistente, dto));
    }

    @Test
    @DisplayName("Deve listar motoristas com paginação")
    void deveListarMotoristasPaginados() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Driver> page = new PageImpl<>(List.of(new Driver()));
        when(driverRepository.findAll(pageable)).thenReturn(page);
        var resultado = adminService.listDrivers(null, pageable);
        assertNotNull(resultado);
        verify(driverRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Deve listar motoristas filtrando por status")
    void listDriversWithStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Driver> page = new PageImpl<>(List.of(new Driver()));
        when(driverRepository.findByRegistrationStatus(RegistrationStatus.PENDING, pageable)).thenReturn(page);
        var result = adminService.listDrivers(RegistrationStatus.PENDING, pageable);
        assertNotNull(result);
        verify(driverRepository, times(1)).findByRegistrationStatus(RegistrationStatus.PENDING, pageable);
    }

    @Test
    @DisplayName("Deve excluir motorista com sucesso")
    void deleteDriverSuccess() {
        UUID id = UUID.randomUUID();
        when(driverRepository.findById(id)).thenReturn(Optional.of(new Driver()));
        adminService.deleteDriver(id);
        verify(driverRepository, times(1)).delete(any(Driver.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar excluir motorista não encontrado")
    void deleteDriverNotFound() {
        UUID id = UUID.randomUUID();
        when(driverRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(UserNotFoundException.class, () -> adminService.deleteDriver(id));
    }

    // updateDriver

    @Test
    @DisplayName("Deve atualizar todos os campos do motorista")
    void updateDriver_updatesAllFields() {
        UUID id = UUID.randomUUID();
        Driver driver = new Driver();
        driver.setName("Antigo");
        driver.setEmail("antigo@email.com");
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any())).thenReturn(driver);
        DriverUpdateDTO dto = new DriverUpdateDTO(
                "Novo Nome", "novo@email.com", "81999999999",
                "22222222222", "61517247047", RegistrationStatus.APPROVED);
        var result = adminService.updateDriver(id, dto);
        assertNotNull(result);
        assertEquals("Novo Nome", driver.getName());
        assertEquals("novo@email.com", driver.getEmail());
    }

    @Test
    @DisplayName("Deve manter campos originais quando dto tiver campos nulos")
    void updateDriver_nullFields_keepsOriginal() {
        UUID id = UUID.randomUUID();
        Driver driver = new Driver();
        driver.setName("Original");
        driver.setEmail("original@email.com");
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any())).thenReturn(driver);
        DriverUpdateDTO dto = new DriverUpdateDTO(null, null, null, null, null, null);
        adminService.updateDriver(id, dto);
        assertEquals("Original", driver.getName());
        assertEquals("original@email.com", driver.getEmail());
    }

    @Test
    @DisplayName("Deve lançar exceção ao atualizar motorista não encontrado")
    void updateDriver_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(driverRepository.findById(id)).thenReturn(Optional.empty());
        DriverUpdateDTO dto = new DriverUpdateDTO("Nome", null, null, null, null, null);
        assertThrows(UserNotFoundException.class, () -> adminService.updateDriver(id, dto));
    }

    @Test
    @DisplayName("Deve rejeitar motorista com motivo")
    void updateDriverStatus_rejected_withReason() {
        UUID id = UUID.randomUUID();
        Driver driver = new Driver();
        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any())).thenReturn(driver);
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(
                RegistrationStatus.REJECTED, "Documento ilegível");
        var result = adminService.updateDriverStatus(id, dto);
        assertNotNull(result);
        assertEquals(RegistrationStatus.REJECTED, driver.getRegistrationStatus());
        assertEquals("Documento ilegível", driver.getRejectionReason());
    }

    // listClients

    @Test
    @DisplayName("Deve listar clientes")
    void listClients_returnsPage() {
        var pageable = PageRequest.of(0, 10);
        var page = new PageImpl<>(List.of(new Passenger()));
        when(passengerRepository.findByFilters(null, null, null, pageable)).thenReturn(page);
        var result = adminService.listClients(null, null, null, pageable);
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    // getClientById

    @Test
    @DisplayName("Deve buscar cliente por id com sucesso")
    void getClientById_success() {
        UUID id = UUID.randomUUID();
        Passenger passenger = new Passenger();
        when(userRepository.findById(id)).thenReturn(Optional.of(passenger));
        Passenger result = adminService.getClientById(id);
        assertNotNull(result);
    }

    @Test
    @DisplayName("Deve lançar exceção quando usuário não for passageiro")
    void getClientById_notPassenger_throws() {
        UUID id = UUID.randomUUID();
        Driver driver = new Driver();
        when(userRepository.findById(id)).thenReturn(Optional.of(driver));
        assertThrows(IllegalArgumentException.class, () -> adminService.getClientById(id));
    }

    @Test
    @DisplayName("Deve lançar exceção quando cliente não encontrado")
    void getClientById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> adminService.getClientById(id));
    }

    // createClient

    @Test
    @DisplayName("Deve criar cliente com sucesso")
    void createClient_success() {
        User user = new Passenger();
        user.setEmail("novo@email.com");
        user.setCpf("52998224725");
        when(userRepository.existsByEmail("novo@email.com")).thenReturn(false);
        when(userRepository.existsByCpf("52998224725")).thenReturn(false);
        when(userRepository.save(any())).thenReturn(user);
        User result = adminService.createClient(user);
        assertNotNull(result);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Deve lançar exceção quando email já existe")
    void createClient_emailExists_throws() {
        User user = new Passenger();
        user.setEmail("existente@email.com");
        user.setCpf("52998224725");
        when(userRepository.existsByEmail("existente@email.com")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> adminService.createClient(user));
    }

    @Test
    @DisplayName("Deve lançar exceção quando CPF já existe")
    void createClient_cpfExists_throws() {
        User user = new Passenger();
        user.setEmail("novo@email.com");
        user.setCpf("52998224725");
        when(userRepository.existsByEmail("novo@email.com")).thenReturn(false);
        when(userRepository.existsByCpf("52998224725")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> adminService.createClient(user));
    }

    // updateClient

    @Test
    @DisplayName("Deve atualizar cliente com sucesso")
    void updateClientSuccess() {
        UUID id = UUID.randomUUID();
        User existingUser = new Passenger();
        existingUser.setName("Antigo");
        User updatedInfo = new Passenger();
        updatedInfo.setName("Novo");
        updatedInfo.setEmail("novo@email.com");
        updatedInfo.setPhone("81999999999");
        when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        adminService.updateClient(id, updatedInfo);
        assertEquals("Novo", existingUser.getName());
        assertEquals("novo@email.com", existingUser.getEmail());
        assertEquals("81999999999", existingUser.getPhone());
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    @DisplayName("Deve manter dados antigos se atualização for parcial")
    void updateClientPartialSuccess() {
        UUID id = UUID.randomUUID();
        User existingUser = new Passenger();
        existingUser.setName("Nome Antigo");
        existingUser.setPhone("81988888888");
        User updatedInfo = new Passenger();
        updatedInfo.setName("Nome Novo");
        when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        adminService.updateClient(id, updatedInfo);
        assertEquals("Nome Novo", existingUser.getName());
        assertEquals("81988888888", existingUser.getPhone());
    }

    // deleteClient

    @Test
    @DisplayName("Deve realizar soft delete do cliente")
    void deleteClientSuccess() {
        UUID id = UUID.randomUUID();
        Passenger passenger = new Passenger();
        passenger.setActive(true);
        when(userRepository.findById(id)).thenReturn(Optional.of(passenger));
        adminService.deleteClient(id);
        assertFalse(passenger.isActive());
        verify(userRepository, times(1)).save(passenger);
    }
}