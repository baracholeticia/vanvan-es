package com.vanvan.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.vanvan.dto.DriverAdminResponseDTO;
import com.vanvan.dto.DriverStatusUpdateDTO;
import com.vanvan.enums.RegistrationStatus;
import com.vanvan.exception.UserNotFoundException;
import com.vanvan.model.Driver;
import com.vanvan.model.Passenger;
import com.vanvan.model.User;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private DriverRepository driverRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    @DisplayName("Deve barrar rejeição sem motivo")
    void testeRejeicaoSemMotivo() {
        UUID id = UUID.randomUUID();
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.REJECTED, null);
        
       
        Driver driver = new Driver(
            "Melissa Pessoa", "12345678901", "87999999999", 
            "melissa@ufape.edu.br", "senha123", "123456789", 
            "pix-da-mel", LocalDate.of(2000, 1, 1)
        );

        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));

        assertThrows(IllegalArgumentException.class, () -> {
            adminService.updateDriverStatus(id, dto);
        });
    }

    @Test
    @DisplayName("Deve aprovar um motorista com sucesso")
    void deveAprovarMotoristaComSucesso() {
        UUID id = UUID.randomUUID();
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.APPROVED, null);
        
        Driver driver = new Driver(
            "Melissa Pessoa", "12345678901", "87999999999", 
            "melissa@ufape.edu.br", "senha123", "123456789", 
            "pix-da-mel", LocalDate.of(2000, 1, 1)
        );

        when(driverRepository.findById(id)).thenReturn(Optional.of(driver));
        when(driverRepository.save(any(Driver.class))).thenReturn(driver);

        DriverAdminResponseDTO resultado = adminService.updateDriverStatus(id, dto);

        assertNotNull(resultado);
        assertEquals(RegistrationStatus.APPROVED, driver.getRegistrationStatus());
        verify(driverRepository, times(1)).save(driver);
    }
    @Test
    @DisplayName("Deve permitir a transição de REJECTED para APPROVED (Comportamento atual)")
    void devePermitirTransicaoDeRejeitadoParaAprovado() {
       
        UUID driverId = UUID.randomUUID();
        Driver motorista = new Driver();
        motorista.setId(driverId);
        motorista.setRegistrationStatus(RegistrationStatus.REJECTED);
        motorista.setRejectionReason("Documento ilegível");

        
        DriverStatusUpdateDTO dto = new DriverStatusUpdateDTO(RegistrationStatus.APPROVED, null);

        when(driverRepository.findById(driverId)).thenReturn(Optional.of(motorista));
        when(driverRepository.save(any(Driver.class))).thenAnswer(invocation -> invocation.getArgument(0));

        
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

        assertThrows(UserNotFoundException.class, () -> {
            adminService.updateDriverStatus(idInexistente, dto);
        });
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
    @DisplayName("Deve listar todos os motoristas quando status for nulo")
    void listDriversWithoutStatus() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Driver> page = new PageImpl<>(List.of(new Driver()));
        when(driverRepository.findAll(pageable)).thenReturn(page);

        var result = adminService.listDrivers(null, pageable);

        assertNotNull(result);
        verify(driverRepository, times(1)).findAll(pageable);
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

    @Test
    @DisplayName("Deve criar cliente com sucesso")
    void createClientSuccess() {
        User user = new Passenger();
        user.setEmail("teste@email.com");

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);

        var result = adminService.createClient(user);

        assertNotNull(result);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    @DisplayName("Deve impedir criação de cliente com email duplicado")
    void createClientEmailExists() {
        User user = new Passenger();
        user.setEmail("teste@email.com");

        when(userRepository.existsByEmail(user.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> adminService.createClient(user));
    }

    @Test
    @DisplayName("Deve atualizar cliente com sucesso (testando os IFs de campos nulos/vazios)")
    void updateClientSuccess() {
        UUID id = UUID.randomUUID();
        User existingUser = new Passenger();
        existingUser.setName("Antigo");

        User updatedInfo = new Passenger();
        updatedInfo.setName("Novo");
        updatedInfo.setEmail("novo@email.com");
        updatedInfo.setPhone("1234");

        when(userRepository.findById(id)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        adminService.updateClient(id, updatedInfo);

        assertEquals("Novo", existingUser.getName());
        assertEquals("novo@email.com", existingUser.getEmail());
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    @DisplayName("Deve realizar soft delete do cliente com sucesso")
    void deleteClientSuccess() {
        UUID id = UUID.randomUUID();
        Passenger passenger = new Passenger();
        passenger.setActive(true); // Garante que ele começa ativo
        when(userRepository.findById(id)).thenReturn(Optional.of(passenger));
        adminService.deleteClient(id);
        assertFalse(passenger.isActive(), "O passageiro deveria estar inativo (active = false)");
        verify(userRepository, times(1)).save(passenger);
        verify(userRepository, times(0)).delete(any(User.class));
    }
    
}