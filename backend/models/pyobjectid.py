# backend/models/pyobjectid.py
from pydantic import BaseModel, Field
from bson import ObjectId
from typing import Any 

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info: Any):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return PyObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, model):
        field_schema.update(type="string")