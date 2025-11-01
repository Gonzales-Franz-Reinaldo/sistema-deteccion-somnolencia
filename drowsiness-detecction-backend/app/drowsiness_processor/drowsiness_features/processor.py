from abc import ABC, abstractmethod


class ProcesadorSomnolencia(ABC):
    @abstractmethod
    def procesar(self, puntos: dict):
        raise NotImplemented