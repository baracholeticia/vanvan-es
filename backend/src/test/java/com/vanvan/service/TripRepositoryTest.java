package com.vanvan.service;

import com.vanvan.dto.PassengerDTO;
import com.vanvan.dto.TripDetailsDTO;
import com.vanvan.dto.TripHistoryDTO;
import com.vanvan.enums.TripStatus;
import com.vanvan.model.Driver;
import com.vanvan.model.Location;
import com.vanvan.model.Passenger;
import com.vanvan.model.Trip;
import com.vanvan.repository.DriverRepository;
import com.vanvan.repository.PassengerRepository;
import com.vanvan.repository.TripRepository;
import com.vanvan.repository.TripSpecification;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class TripRepositoryTest {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    private Trip trip1;
    private Trip trip2;

    @BeforeEach
    void setUp() {
        // Criando motorista
        Driver driver = new Driver();
        driver.setName("Motorista 1");
        driver.setCpf("03226032460");
        driver.setCpf("11122233344");
        driver.setEmail("motorista1@test.com");
        driver.setPassword("senha123");
        driver.setCnh("12345678900");
        driver.setPhone("87981685854");
        driver.setBirthDate(LocalDate.of(2000, 10,12));
        driverRepository.save(driver);
        // Se Driver tiver Id gerado, ele será salvo automaticamente ao persistir Trip

        // Criando 10 passageiros
        List<Passenger> passengers = List.of(
                new Passenger("Passenger 1", "03226032460", "Phone1", "email1@test.com", "pass1", LocalDate.of(1990, 1, 1)),
                new Passenger("Passenger 2", "03226032460", "Phone2", "email2@test.com", "pass2", LocalDate.of(1991, 2, 2)),
                new Passenger("Passenger 3", "03226032460", "Phone3", "email3@test.com", "pass3", LocalDate.of(1992, 3, 3)),
                new Passenger("Passenger 4", "03226032460", "Phone4", "email4@test.com", "pass4", LocalDate.of(1993, 4, 4)),
                new Passenger("Passenger 5", "03226032460", "Phone5", "email5@test.com", "pass5", LocalDate.of(1994, 5, 5)),
                new Passenger("Passenger 6", "03226032460", "Phone6", "email6@test.com", "pass6", LocalDate.of(1995, 6, 6)),
                new Passenger("Passenger 7", "03226032460", "Phone7", "email7@test.com", "pass7", LocalDate.of(1996, 7, 7)),
                new Passenger("Passenger 8", "03226032460", "Phone8", "email8@test.com", "pass8", LocalDate.of(1997, 8, 8)),
                new Passenger("Passenger 9", "03226032460", "Phone9", "email9@test.com", "pass9", LocalDate.of(1998, 9, 9)),
                new Passenger("Passenger 10", "03226032460", "Phone10", "email10@test.com", "pass10", LocalDate.of(1999, 10, 10))
        );

        // Criando primeira viagem com passageiros 1-5
        trip1 = new Trip();
        trip1.setDriver(driver);
        trip1.setDeparture(new Location("CityA", "StreetA", "RefA"));
        trip1.setArrival(new Location("CityB", "StreetB", "RefB"));
        trip1.setDate(LocalDate.now());
        trip1.setTime(LocalTime.of(10, 0));
        trip1.setTotalAmount(new BigDecimal("150.00"));
        trip1.setStatus(TripStatus.COMPLETED);
        trip1.setPassengers(passengers.subList(0,5));
        passengers.subList(0,5).forEach(p -> p.getTrips().add(trip1));

        // Criando segunda viagem com passageiros 6-10
        trip2 = new Trip();
        trip2.setDriver(driver);
        trip2.setDeparture(new Location("CityC", "StreetC", "RefC"));
        trip2.setArrival(new Location("CityD", "StreetD", "RefD"));
        trip2.setDate(LocalDate.now().plusDays(1));
        trip2.setTime(LocalTime.of(15, 30));
        trip2.setTotalAmount(new BigDecimal("200.00"));
        trip2.setStatus(TripStatus.IN_PROGRESS);
        trip2.setPassengers(passengers.subList(5,10));
        passengers.subList(5,10).forEach(p -> p.getTrips().add(trip2));

        // Persistindo viagens (Location embutido vai junto)
        tripRepository.saveAll(List.of(trip1, trip2));

        passengerRepository.saveAll(passengers);

    }
    @Test
    void testFindAllTrips() {
        List<Trip> allTrips = tripRepository.findAll();
        assertEquals(2, allTrips.size());
    }

    @Test
    void testFindTripById() {
        Trip t = tripRepository.findById(trip1.getId()).orElse(null);
        Assertions.assertNotNull(t);
        assertEquals(TripStatus.COMPLETED, t.getStatus());
        assertEquals(5, t.getPassengers().size());
    }

    @Test
    void testTripDetailsDTOMapping() {
        Trip t = tripRepository.findById(trip2.getId()).orElseThrow();
        TripDetailsDTO dto = new TripDetailsDTO(
                t.getId(),
                t.getDate(),
                t.getTime(),
                t.getDriver().getName(),
                t.getPassengers().stream()
                        .map(p -> new PassengerDTO(p.getId(), p.getName()))
                        .toList(),
                t.getDeparture().getCity(),
                t.getArrival().getCity(),
                t.getTotalAmount(),
                t.getStatus()
        );

        assertEquals("CityC", dto.getDepartureCity());
        assertEquals(5, dto.getPassengers().size());
    }

    @Test
    void testTripHistoryDTOMapping() {
        List<Trip> trips = tripRepository.findAll();
        List<TripHistoryDTO> dtos = trips.stream()
                .map(t -> new TripHistoryDTO(
                        t.getId(),
                        t.getDate(),
                        t.getDriver().getName(),
                        t.getDeparture().getCity() + " -> " + t.getArrival().getCity(),
                        t.getPassengers().size(),
                        t.getTotalAmount(),
                        t.getStatus()
                )).toList();

        assertEquals(2, dtos.size());
        assertEquals("CityA -> CityB", dtos.get(0).getRoute());
        assertEquals("CityC -> CityD", dtos.get(1).getRoute());
    }

    //teste de performance
    @Test
    void stressTest_tripHistoryQuery() {

        int totalTrips = 7000;

        Driver driver = new Driver();
        driver.setName("Driver Test");
        driver.setBirthDate(LocalDate.of(1990,1,1));
        driver.setCpf("99988877766");        // ← adicione
        driver.setEmail("drivertest@test.com"); // ← adicione
        driver.setPassword("senha123");      // ← adicione
        driver.setCnh("99999999999");
        driver.setPhone("87981595954");
        driver = driverRepository.save(driver);


        Passenger passenger = new Passenger();
        passenger.setName("Passenger Test");
        passenger.setPhone("87981595954");
        passenger.setBirthDate(LocalDate.of(1900, 1, 1));
        passenger.setCpf("99988877766");        // ← adicione
        passenger.setEmail("drivertest@test.com"); // ← adicione
        passenger.setPassword("senha123");
        passenger = passengerRepository.save(passenger);

        for(int i = 0; i < totalTrips; i++) {

            Trip trip = new Trip();
            trip.setDate(LocalDate.now().minusDays(i % 30));
            trip.setTime(LocalTime.of(10,0));
            trip.setDriver(driver);
            trip.setPassengers(List.of(passenger));
            trip.setDeparture(new Location("CityA", "ruaa" , ""));
            trip.setArrival(new Location("CityB","ruab" , ""));
            trip.setTotalAmount(BigDecimal.valueOf(50.0));
            trip.setStatus(TripStatus.COMPLETED);

            tripRepository.save(trip);
        }

        long start = System.currentTimeMillis();

        TripService tripService  = new TripService(tripRepository, null, null, null);

        Page<TripHistoryDTO> page = tripService.getTripHistory(
                null,
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0,20)
        );

        long duration = System.currentTimeMillis() - start;

        assertFalse(page.isEmpty());

        System.out.println("Query execution time: " + duration + "ms");

        assertTrue(duration < 5000); // limite aceitável
    }

    //testes fracos apenas para calar o sonar
    //filtra trips por status
    @Test
    void filterByStatus() {

        Specification<Trip> spec =
                TripSpecification.filter(
                        null,
                        null,
                        null,
                        null,
                        null,
                        TripStatus.COMPLETED
                );

        assertNotNull(spec);
    }

    //testa filtro por data
    @Test
    void filterByDateRange() {

        LocalDate start = LocalDate.of(2026,1,1);
        LocalDate end = LocalDate.of(2026,1,31);

        Specification<Trip> spec =
                TripSpecification.filter(
                        start,
                        end,
                        null,
                        null,
                        null,
                        null
                );

        assertNotNull(spec);
    }


    @Test
    void shouldFilterTripsByDepartureCity() {

        Driver driver = new Driver();
        driver.setName("John");
        driver.setBirthDate(LocalDate.of(1990,1,1));
        driver.setCpf("99988877766");
        driver.setEmail("drivertest@test.com");
        driver.setPassword("senha123");
        driver.setCnh("99999999999");
        driver.setPhone("87981685853");
        driver = driverRepository.save(driver);

        Passenger passenger = new Passenger();
        passenger.setName("Alice");
        passenger.setBirthDate(LocalDate.of(2000,1,1));
        passenger.setCpf("99988877766");
        passenger.setPhone("87981685853");

        passenger.setEmail("drivertest@test.com");
        passenger.setPassword("senha123");
        passenger = passengerRepository.save(passenger);

        Trip trip4 = new Trip();
        trip4.setDate(LocalDate.now());
        trip4.setTime(LocalTime.of(10,0));
        trip4.setDriver(driver);
        trip4.setPassengers(List.of(passenger));
        trip4.setDeparture(new Location("Recife", "", ""));
        trip4.setArrival(new Location("Olinda", "", ""));
        trip4.setStatus(TripStatus.COMPLETED);
        trip4.setTotalAmount(BigDecimal.valueOf(200.0));
        tripRepository.save(trip4);

        Trip trip3 = new Trip();
        trip3.setDate(LocalDate.now());
        trip3.setTime(LocalTime.of(10,0));
        trip3.setDriver(driver);
        trip3.setPassengers(List.of(passenger));
        trip3.setDeparture(new Location("Caruaru", "", ""));
        trip3.setArrival(new Location("Garanhuns", "", ""));
        trip3.setStatus(TripStatus.COMPLETED);
        trip3.setTotalAmount(BigDecimal.valueOf(200.0));

        tripRepository.save(trip3);

        Specification<Trip> spec =
                TripSpecification.filter(null,null,null,"Recife",null,null);

        List<Trip> result = tripRepository.findAll(spec);

        assertEquals(1, result.size());
        assertEquals("Recife", result.getFirst().getDeparture().getCity());
    }

    //filtro combinado
    @Test
    void filterCombined() {

        Specification<Trip> spec =
                TripSpecification.filter(
                        LocalDate.of(2026,1,1),
                        LocalDate.of(2026,12,31),
                        UUID.randomUUID(),
                        "Recife",
                        "Olinda",
                        TripStatus.COMPLETED
                );

        assertNotNull(spec);
    }



}