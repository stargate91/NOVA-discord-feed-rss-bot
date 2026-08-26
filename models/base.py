from typing import Any
from pydantic import BaseModel, ConfigDict

class DomainModel(BaseModel):
    """
    Base Pydantic v2 domain model providing strict validation, serialization,
    and dictionary-like access for seamless backward compatibility.
    """
    model_config = ConfigDict(
        extra="allow",
        populate_by_name=True,
        arbitrary_types_allowed=True,
        validate_assignment=True
    )

    def __getitem__(self, item: str) -> Any:
        try:
            return getattr(self, item)
        except AttributeError:
            raise KeyError(item)

    def __setitem__(self, key: str, value: Any) -> None:
        setattr(self, key, value)

    def __contains__(self, key: str) -> bool:
        return hasattr(self, key) or (self.__pydantic_extra__ is not None and key in self.__pydantic_extra__)

    def get(self, key: str, default: Any = None) -> Any:
        val = getattr(self, key, None)
        if val is not None:
            return val
        if self.__pydantic_extra__ and key in self.__pydantic_extra__:
            return self.__pydantic_extra__[key]
        return default

    def to_dict(self) -> dict[str, Any]:
        """Serialize domain model to standard dict."""
        return self.model_dump()

class ServiceResult(DomainModel):
    """
    Standard domain result pattern for service and repository operations.
    Supports unpacking (success, message = result) for seamless backwards compatibility,
    as well as truthiness evaluation (if result: ...).
    """
    success: bool
    message: str = ""
    data: dict[str, Any] | None = None
    error_code: str | None = None

    def __iter__(self):
        yield self.success
        yield self.message

    def __bool__(self) -> bool:
        return self.success
