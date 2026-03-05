package com.vanvan.exception;
public class InvalidValueException extends RuntimeException {

  public InvalidValueException(String message) {
    super(message);
  }

  public InvalidValueException(String field, String value) {
    super("Valor inválido para " + field + ": " + value);
  }
}
