from abc import ABC, abstractmethod


class ProcesadorRostro(ABC):
    @abstractmethod
    def procesar(self, puntos: dict):
        raise NotImplemented