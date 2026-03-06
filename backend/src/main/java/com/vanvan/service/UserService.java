package com.vanvan.service;

import com.vanvan.dto.RegisterDTO;
import com.vanvan.dto.DriverWithVehicleResponseDTO;
import com.vanvan.dto.UserResponseDTO;
import com.vanvan.dto.VehicleResponseDTO;
import com.vanvan.exception.UnderageUserException;
import com.vanvan.exception.CnhAlreadyExistsException;
import com.vanvan.exception.UnderageDriverException;
import com.vanvan.model.Driver;
import com.vanvan.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.vanvan.exception.CpfAlreadyExistsException;
import com.vanvan.exception.EmailAlreadyExistsException;
import com.vanvan.model.Administrator;
import com.vanvan.model.Passenger;
import com.vanvan.repository.AdministratorRepository;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.UserRepository;

import java.time.LocalDate;
import java.time.Period;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PassengerRepository passengerRepository;
    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;
    private final VehicleService vehicleService;

    @Transactional(rollbackFor = Exception.class)
    public DriverWithVehicleResponseDTO registerDriverWithVehicle(
            RegisterDTO driverData,
            String vehicleModelName,
            String vehicleLicensePlate,
            MultipartFile vehicleDocument,
            MultipartFile vehiclePhoto
    ) throws IOException {
        // Registrar o motorista (salva na transação)
        var user = this.register(driverData);
        Driver driver = (Driver) user;

        // Criar o veículo associado ao motorista (se falhar, rollback em driver)
        VehicleResponseDTO vehicle = vehicleService.createVehicle(
                driver.getId(),
                vehicleModelName,
                vehicleLicensePlate,
                vehicleDocument,
                vehiclePhoto
        );

        return new DriverWithVehicleResponseDTO(UserResponseDTO.from(driver), vehicle);
    }

    public User register(RegisterDTO data) {

        var user = data.toEntity();

        //faz todas validações aqui e retorna runtimeexceptions personalizadas caso falhe
        validateUser(user);

        // Criptografa a senha
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);

        // Faz o switch pelo tipo de usuário
        return switch (user.getRole()) {
            case PASSENGER -> {
                assert user instanceof Passenger;
                yield passengerRepository.save((Passenger) user);
            }
            case ADMIN -> {
                assert user instanceof Administrator;
                yield administratorRepository.save((Administrator) user);
            }
            case DRIVER -> {
                assert user instanceof Driver;
                yield driverRepository.save((Driver) user);
            }
        };
    }

    //métod0 extraído para cá para melhor separação de responsabilidades
    private void validateUser(User user) {

        //valida idade
        validateAge(user);

        //verifica se o e-mail já está cadastrado
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new EmailAlreadyExistsException(user.getEmail());
        }
        // Verifica se o CPF já está cadastrado
        else if (userRepository.findByCpf(user.getCpf()) != null) {
            throw new CpfAlreadyExistsException(user.getCpf());
            //verifica cnh em caso de driver
        } else if (user instanceof Driver driver && driverRepository.existsByCnh(driver.getCnh())) {
            throw new CnhAlreadyExistsException(driver.getCnh());
        }
    }

    //validação de idade
    private void validateAge(User user){
        int age = Period.between(user.getBirthDate(), LocalDate.now()).getYears();

        if (user instanceof Driver && age < 21) {
             throw new UnderageDriverException();
        }
        if (age < 18){
            throw new UnderageUserException();
        }

    }


}