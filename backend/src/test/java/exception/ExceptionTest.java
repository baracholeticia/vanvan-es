package exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.vanvan.exception.CnhAlreadyExistsException;
import com.vanvan.exception.CpfAlreadyExistsException;
import com.vanvan.exception.DocumentRequiredException;
import com.vanvan.exception.DriverNotFoundException;
import com.vanvan.exception.EmptyFileException;
import com.vanvan.exception.FileStorageException;
import com.vanvan.exception.InvalidDocumentTypeException;
import com.vanvan.exception.InvalidImageTypeException;
import com.vanvan.exception.InvalidLicensePlateException;
import com.vanvan.exception.UnderageDriverException;
import com.vanvan.exception.UnderageUserException;
import com.vanvan.exception.VehicleNotFoundException;
import com.vanvan.exception.VehiclePhotoNotFoundException;


class ExceptionTest {



    @Test
    @DisplayName("Cobre CnhAlreadyExistsException")
    void testeCnhAlreadyExistsException() {
        String cnh = "123456789";
        CnhAlreadyExistsException exception = new CnhAlreadyExistsException(cnh);
        assertEquals("Esta CNH já está cadastrada " + cnh, exception.getMessage());

    }

    @Test
    @DisplayName("Cobre CpfAlreadyExistsException")
    void testeCpfAlreadyExistsException() {
        String cpf = "123.456.789-00";
        CpfAlreadyExistsException exception = new CpfAlreadyExistsException(cpf);
        assertEquals("Este CPF já está cadastrado: " + cpf, exception.getMessage());

    }

    @Test
    @DisplayName("Cobre DriverNotFoundException")
    void testeDriverNotFoundException() {
        DriverNotFoundException ex = new DriverNotFoundException();
        assertEquals("O motorista não foi encontrado.", ex.getMessage());

    }

    @Test
    @DisplayName("Cobre UnderageDriverException")
    void testeIdadeMotorista() {
        UnderageDriverException ex1 = new UnderageDriverException();
        UnderageDriverException ex2 = new UnderageDriverException("Erro custom");
        assertEquals("Motorista está abaixo da idade mínima permitida.", ex1.getMessage());
        assertEquals("Erro custom", ex2.getMessage());

   

    }

    @Test
    @DisplayName("Cobre UnderageUserException")
    void testeIdadeUsuario() {
        UnderageUserException ex = new UnderageUserException();
        assertEquals("Usuário está abaixo da idade permitida.", ex.getMessage());
    }

    @Test
    @DisplayName("Cobre EmptyFileException")
    void testeArquivoVazio() {
        EmptyFileException ex1 = new EmptyFileException("arquivo vazio");
        EmptyFileException ex2 = new EmptyFileException();
        assertNotNull(ex1.getMessage());
        assertNotNull(ex2.getMessage());

    }



    @Test
    @DisplayName("Cobre DocumentRequiredException")
    void testeDocumentoObrigatorio() {
        DocumentRequiredException ex = new DocumentRequiredException();
        assertEquals("O documento do veículo é obrigatório. Envie um arquivo PDF válido", ex.getMessage());
    }

    @Test
    @DisplayName("Cobre InvalidDocumentTypeException")
    void testeTipoDocumentoInvalido() {
        InvalidDocumentTypeException ex = new InvalidDocumentTypeException();
        assertEquals("O documento do veículo deve ser um arquivo PDF", ex.getMessage());

    }

    @Test
    @DisplayName("Deve instanciar VehicleNotFoundException com a mensagem correta")
    void vehicleNotFoundExceptionTest() {
        String mensagem = "Veículo não encontrado no sistema";
        VehicleNotFoundException exception = new VehicleNotFoundException(mensagem);
        assertEquals(mensagem, exception.getMessage());

        assertThrows(VehicleNotFoundException.class, () -> {
            throw new VehicleNotFoundException("Erro genérico");
        });

    }

    @Test
    @DisplayName("Deve instanciar VehiclePhotoNotFoundException com mensagem padrão")
    void vehiclePhotoNotFoundExceptionDefaultTest() {
        VehiclePhotoNotFoundException exception = new VehiclePhotoNotFoundException();
        assertEquals("Este veículo não possui foto cadastrada", exception.getMessage());

    }

    @Test
    @DisplayName("Deve instanciar VehiclePhotoNotFoundException com ID do veículo")

    void vehiclePhotoNotFoundExceptionWithIdTest() {
        String vehicleId = "ABC-1234";
        String mensagemEsperada = "O veículo 'ABC-1234' não possui foto cadastrada";
        VehiclePhotoNotFoundException exception = new VehiclePhotoNotFoundException(vehicleId);
        assertEquals(mensagemEsperada, exception.getMessage());

    }

   @Test
    @DisplayName("Cobre FileStorageException - Mensagem e Causa")
    void fileStorageExceptionTest() {
        String msg = "Erro no armazenamento";
        RuntimeException causa = new RuntimeException("Falha de disco");
        FileStorageException ex1 = new FileStorageException(msg);
        FileStorageException ex2 = new FileStorageException(msg, causa);
        
        assertEquals(msg, ex1.getMessage());
        assertEquals(causa, ex2.getCause());
    }
    @Test
    @DisplayName("Cobre InvalidImageTypeException")
    void testeTipoImagemInvalido() {
        InvalidImageTypeException ex1 = new InvalidImageTypeException();
        assertEquals("A foto do veículo deve ser uma imagem nos formatos JPG, JPEG ou PNG", ex1.getMessage());
 
        String msg = "Formato não suportado";
        InvalidImageTypeException ex2 = new InvalidImageTypeException(msg);
        assertEquals(msg, ex2.getMessage());
    }
    @Test
    @DisplayName("Cobre InvalidLicensePlateException")
    void testeInvalidLicensePlateException() {
        String placa = "ABC1D23";
        InvalidLicensePlateException ex1 = new InvalidLicensePlateException();
        InvalidLicensePlateException ex2 = new InvalidLicensePlateException(placa);
        
        assertEquals("A placa do veículo é inválida. Use o formato Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)", ex1.getMessage());
        assertNotNull(ex2.getMessage());
    }
   
}