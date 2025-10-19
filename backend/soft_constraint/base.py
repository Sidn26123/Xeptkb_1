# soft_constraints/base.py
from abc import ABC, abstractmethod

class SoftConstraint(ABC):
    """Interface cho mọi ràng buộc mềm"""
    name: str = "base"

    @abstractmethod
    def evaluate(self, schedule) -> float:
        """Tính penalty cho schedule, return 0 nếu không vi phạm"""
        pass

    def __repr__(self):
        return f"<SoftConstraint {self.name}>"
