package com.github.shudharshan07.stockwars.wars;

import jakarta.validation.constraints.*;

import java.util.Arrays;
import java.util.List;

public class WarConfig {
    @DecimalMin(value = "0.0", inclusive = false, message = "Initial balance must be greater than 0")
    @DecimalMax(value = "1000000000.0", message = "Initial balance is too large")
    private double initialBalance;

    @Min(value = 100, message = "Price tick must be at least 100 ms")
    @Max(value = 60000, message = "Price tick cannot exceed 60 seconds")
    private int priceTickMs;

    @Min(value = 1, message = "Minimum order size must be at least 1")
    @Max(value = 1000000, message = "Minimum order size too large")
    private int minOrderSize;

    @Min(value = 1, message = "Maximum order size must be at least 1")
    @Max(value = 1000000, message = "Maximum order size too large")
    private int maxOrderSize;

    @Min(value = 0, message = "Price precision cannot be negative")
    @Max(value = 10, message = "Price precision too large")
    private int pricePrecision;

    @Min(value = 0, message = "Quantity precision cannot be negative")
    @Max(value = 10, message = "Quantity precision too large")
    private int quantityPrecision;

    @Min(value = 1, message = "Max open orders must be at least 1")
    @Max(value = 10000, message = "Max open orders too large")
    private int maxOpenOrders;

    public WarConfig()
    {
        this.initialBalance = 100000;
        this.priceTickMs = 1000;
        this.minOrderSize = 1;
        this.maxOrderSize = 1000;
        this.pricePrecision = 2;
        this.quantityPrecision = 0;
        this.maxOpenOrders = 50;
    }

    public WarConfig(double initialBalance, List<String> symbols, int priceTickMs, int minOrderSize, int maxOrderSize, int pricePrecision, int quantityPrecision, int maxOpenOrders) {
        this.initialBalance = initialBalance;
        this.priceTickMs = priceTickMs;
        this.minOrderSize = minOrderSize;
        this.maxOrderSize = maxOrderSize;
        this.pricePrecision = pricePrecision;
        this.quantityPrecision = quantityPrecision;
        this.maxOpenOrders = maxOpenOrders;
    }

    public double getInitialBalance() {
        return initialBalance;
    }

    public void setInitialBalance(double initialBalance) {
        this.initialBalance = initialBalance;
    }

    public int getPriceTickMs() {
        return priceTickMs;
    }

    public void setPriceTickMs(int priceTickMs) {
        this.priceTickMs = priceTickMs;
    }

    public int getMinOrderSize() {
        return minOrderSize;
    }

    public void setMinOrderSize(int minOrderSize) {
        this.minOrderSize = minOrderSize;
    }

    public int getMaxOrderSize() {
        return maxOrderSize;
    }

    public void setMaxOrderSize(int maxOrderSize) {
        this.maxOrderSize = maxOrderSize;
    }

    public int getPricePrecision() {
        return pricePrecision;
    }

    public void setPricePrecision(int pricePrecision) {
        this.pricePrecision = pricePrecision;
    }

    public int getQuantityPrecision() {
        return quantityPrecision;
    }

    public void setQuantityPrecision(int quantityPrecision) {
        this.quantityPrecision = quantityPrecision;
    }

    public int getMaxOpenOrders() {
        return maxOpenOrders;
    }

    public void setMaxOpenOrders(int maxOpenOrders) {
        this.maxOpenOrders = maxOpenOrders;
    }
}
