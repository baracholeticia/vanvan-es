package exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.vanvan.enums.TripStatus;
import com.vanvan.enums.UserRole;
import com.vanvan.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;
import java.util.UUID;

class ExceptionTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

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

    @Test
    @DisplayName("Cobre InvalidStatusTransitionException")
    void testeInvalidStatusTransitionException() {
        InvalidStatusTransitionException ex = new InvalidStatusTransitionException(
                TripStatus.COMPLETED, TripStatus.SCHEDULED);
        assertTrue(ex.getMessage().contains("COMPLETED"));
        assertTrue(ex.getMessage().contains("SCHEDULED"));
    }

    @Test
    @DisplayName("Cobre UnknownErrorException")
    void testeUnknownErrorException() {
        UnknownErrorException ex = new UnknownErrorException("erro inesperado");
        assertEquals("erro inesperado", ex.getMessage());
    }

    @Test
    @DisplayName("Cobre InvalidValueException - construtor simples")
    void testeInvalidValueException() {
        InvalidValueException ex = new InvalidValueException("valor inválido");
        assertEquals("valor inválido", ex.getMessage());
    }

    @Test
    @DisplayName("Cobre InvalidValueException - construtor field/value")
    void testeInvalidValueExceptionFieldValue() {
        InvalidValueException ex = new InvalidValueException("preco", "-1");
        assertTrue(ex.getMessage().contains("preco"));
    }

    @Test
    @DisplayName("Cobre LicensePlateAlreadyExistsException")
    void testeLicensePlateAlreadyExists() {
        LicensePlateAlreadyExistsException ex = new LicensePlateAlreadyExistsException("ABC1D23");
        assertTrue(ex.getMessage().contains("ABC1D23"));
    }

    @Test
    @DisplayName("Cobre TripNotFoundException")
    void testeTripNotFoundException() {
        TripNotFoundException ex = new TripNotFoundException("99");
        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    @DisplayName("Cobre UserNotFoundException")
    void testeUserNotFoundException() {
        UserNotFoundException ex = new UserNotFoundException(UserRole.DRIVER, UUID.randomUUID());
        assertTrue(ex.getMessage().contains("DRIVER"));
    }

    @Test
    @DisplayName("Cobre FileSizeExceededException - construtor com nome")
    void testeFileSizeExceededComNome() {
        FileSizeExceededException ex = new FileSizeExceededException("foto.jpg", 10L);
        assertTrue(ex.getMessage().contains("foto.jpg"));
        assertTrue(ex.getMessage().contains("10"));
    }

    @Test
    @DisplayName("Cobre FileSizeExceededException - construtor sem nome")
    void testeFileSizeExceededSemNome() {
        FileSizeExceededException ex = new FileSizeExceededException(10L);
        assertTrue(ex.getMessage().contains("10"));
    }

    // GlobalExceptionHandler 

    @Test
    @DisplayName("Handler: CpfAlreadyExists → 409")
    void handleCpfAlreadyExists_returnsConflict() {
        ResponseEntity<Map<String, String>> response =
                handler.handleCpfAlreadyExists(new CpfAlreadyExistsException("123"));
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: EmailAlreadyExists → 409")
    void handleEmailAlreadyExists_returnsConflict() {
        ResponseEntity<Map<String, String>> response =
                handler.handleEmailAlreadyExists(new EmailAlreadyExistsException("a@b.com"));
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: CnhAlreadyExists → 409")
    void handleCnhAlreadyExists_returnsConflict() {
        ResponseEntity<Map<String, String>> response =
                handler.handleCnhAlreadyExists(new CnhAlreadyExistsException("123"));
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: UnderageDriver → 400")
    void handleUnderageDriver_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleUnderageDriver(new UnderageDriverException());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: UnderageUser → 400")
    void handleUnderageUser_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleUnderageUser(new UnderageUserException());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: UserNotFound → 404")
    void handleUserNotFound_returnsNotFound() {
        ResponseEntity<Map<String, String>> response =
                handler.handleUserNotFound(new UserNotFoundException(UserRole.DRIVER, UUID.randomUUID()));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("DRIVER"));
    }

    @Test
    @DisplayName("Handler: JWTVerification → 401")
    void handleJWT_returnsUnauthorized() {
        ResponseEntity<Map<String, String>> response =
                handler.handleJWTVerificationException(new JWTVerificationException("invalid"));
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Token inválido ou expirado", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Handler: DisabledException → 403")
    void handleDisabled_returnsForbidden() {
        ResponseEntity<Map<String, String>> response =
                handler.handleDisabledException(new DisabledException("disabled"));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("desabilitada"));
    }

    @Test
    @DisplayName("Handler: LockedException → 423")
    void handleLocked_returnsLocked() {
        ResponseEntity<Map<String, String>> response =
                handler.handleLockedException(new LockedException("locked"));
        assertEquals(HttpStatus.LOCKED, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("bloqueada"));
    }

    @Test
    @DisplayName("Handler: BadCredentials → 401")
    void handleBadCredentials_returnsUnauthorized() {
        ResponseEntity<Map<String, String>> response =
                handler.handleBadCredentialsException(new BadCredentialsException("bad"));
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Usuário ou senha inválidos.", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Handler: AccessDenied → 403")
    void handleAccessDenied_returnsForbidden() {
        ResponseEntity<Map<String, String>> response =
                handler.handleAccessDeniedException(new AccessDeniedException("denied"));
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(response.getBody().get("message").contains("negado"));
    }

    @Test
    @DisplayName("Handler: VehicleNotFound → 404")
    void handleVehicleNotFound_returnsNotFound() {
        ResponseEntity<Map<String, String>> response =
                handler.handleVehicleNotFound(new VehicleNotFoundException("não encontrado"));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: LicensePlateAlreadyExists → 409")
    void handleLicensePlate_returnsConflict() {
        ResponseEntity<Map<String, String>> response =
                handler.handleLicensePlateAlreadyExists(new LicensePlateAlreadyExistsException("ABC1D23"));
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: InvalidDocumentType → 400")
    void handleInvalidDocumentType_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleInvalidDocumentType(new InvalidDocumentTypeException());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: InvalidImageType → 400")
    void handleInvalidImageType_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleInvalidImageType(new InvalidImageTypeException());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: InvalidLicensePlate → 400")
    void handleInvalidLicensePlate_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleInvalidLicensePlate(new InvalidLicensePlateException());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: FileSizeExceeded → 400")
    void handleFileSizeExceeded_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleFileSizeExceeded(new FileSizeExceededException("foto.jpg", 10L));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: DocumentRequired → 400")
    void handleDocumentRequired_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleDocumentRequired(new DocumentRequiredException());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: EmptyFile → 400")
    void handleEmptyFile_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleEmptyFile(new EmptyFileException("documento"));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: FileStorage → 500")
    void handleFileStorage_returnsInternalServerError() {
        ResponseEntity<Map<String, String>> response =
                handler.handleFileStorage(new FileStorageException("erro"));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: VehiclePhotoNotFound → 404")
    void handleVehiclePhotoNotFound_returnsNotFound() {
        ResponseEntity<Map<String, String>> response =
                handler.handleVehiclePhotoNotFound(new VehiclePhotoNotFoundException("uuid-123"));
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: IllegalArgument → 400")
    void handleIllegalArgument_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleIllegalArgument(new IllegalArgumentException("argumento inválido"));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("argumento inválido", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Handler: InvalidValue → 400")
    void handleInvalidValue_returnsBadRequest() {
        ResponseEntity<Map<String, String>> response =
                handler.handleInvalidValue(new InvalidValueException("valor inválido"));
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @DisplayName("Handler: MethodArgumentNotValid → 400")
    void handleValidationExceptions_returnsBadRequest() throws Exception {
        var bindingResult = new BeanPropertyBindingResult(new Object(), "obj");
        bindingResult.addError(new FieldError("obj", "campo", "Campo obrigatório"));
        var ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationExceptions(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Campo obrigatório", response.getBody().get("message"));
    }
}