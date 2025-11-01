from abc import ABC, abstractmethod


class ProcesadorManos(ABC):
    @abstractmethod
    def procesar(self, puntos_mano: dict, puntos_ojos: dict):
        raise NotImplemented