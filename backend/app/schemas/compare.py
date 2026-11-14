from pydantic import BaseModel, Field, field_validator

from app.schemas.analysis import AnalysisRequest, AnalysisResponse


class ScenarioInput(BaseModel):
    label: str | None = None
    request: AnalysisRequest


class CompareRequest(BaseModel):
    scenarios: list[ScenarioInput]

    @field_validator("scenarios")
    @classmethod
    def two_or_three(cls, value: list[ScenarioInput]) -> list[ScenarioInput]:
        if len(value) < 2 or len(value) > 3:
            raise ValueError("compare requires 2 or 3 scenarios")
        return value


class AlignedMetric(BaseModel):
    key: str
    unit: str
    values: list[float | None]


class ScenarioResult(BaseModel):
    index: int
    label: str | None = None
    analysis: AnalysisResponse | None = None
    error: dict | None = None


class CompareResponse(BaseModel):
    comparison_id: str
    status: str
    scenarios: list[ScenarioResult]
    aligned_metrics: list[AlignedMetric]
    warnings: list[str] = Field(default_factory=list)
