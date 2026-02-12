package com.vanvan.service;

import com.vanvan.dto.DriverRegisterRequestDTO;
import com.vanvan.dto.RegisterDTO;
import com.vanvan.dto.RegisterRequestDTO;
import com.vanvan.exception.CnhAlreadyExistsException;
import com.vanvan.model.Driver;
import com.vanvan.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.vanvan.exception.CpfAlreadyExistsException;
import com.vanvan.exception.EmailAlreadyExistsException;
import com.vanvan.model.Administrator;
import com.vanvan.model.Passenger;
import com.vanvan.repository.AdministratorRepository;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.UserRepository;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(RegisterDTO data) {

        var user = convertToUser(data);
        // Verifica se o e-mail já está cadastrado
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new EmailAlreadyExistsException(user.getName());
        }
        // Verifica se o CPF já está cadastrado
        else if (userRepository.findByCpf(user.getCpf()) != null) {
            throw new CpfAlreadyExistsException(user.getCpf());
            //verifica ecnh em caso de driver
        } else if (user instanceof Driver driver && driverRepository.existsByCnh(driver.getCnh())) {
            throw new CnhAlreadyExistsException(driver.getCnh());
        }
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

   /*
   * Transforma DTO em seu respectivo User
   * **/
    private User convertToUser(RegisterDTO dto) {
        return switch (dto.role()) {
            case "passenger" -> {
                if (dto instanceof RegisterRequestDTO p) {
                    
                    yield new Passenger(p.name(), p.cpf(), p.phone(), p.email(), p.password());
                }
                throw new IllegalArgumentException("Dados inválidos para passageiro.");
            }
            case "admin" -> {
                if (dto instanceof RegisterRequestDTO a) {
                    yield new Administrator(a.name(), a.cpf(), a.phone(), a.email(), a.password());
                }
                throw new IllegalArgumentException("Dados inválidos para administrador.");
            }
            case "driver" -> {
                if (dto instanceof DriverRegisterRequestDTO d) {
                    yield new Driver(
                        d.name(),
                        d.cpf(),
                        d.phone(),
                        d.email(),
                        d.password(),
                        d.cnh(),
                        d.pixKey()
                    );
                }
                throw new IllegalArgumentException("Dados inválidos para motorista.");
            }
            default -> throw new IllegalArgumentException("Tipo de usuário inválido");
        };
    }


}