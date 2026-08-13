from sqlalchemy.orm import Session


def get_by_id(db: Session, model, object_id: int):
    return db.query(model).filter(model.id == object_id).first()


def get_all(db: Session, model):
    return db.query(model).all()


def create(db: Session, obj):
    try:
        db.add(obj)
        db.commit()
        db.refresh(obj)

        return obj

    except Exception:
        db.rollback()
        raise


def update_by_id(db: Session, model, object_id: int, data: dict):
    obj = get_by_id(db, model, object_id)

    if not obj:
        return None

    for field, value in data.items():
        setattr(obj, field, value)

    try:
        db.commit()
        db.refresh(obj)

        return obj

    except Exception:
        db.rollback()
        raise


def delete_by_id(db: Session, model, object_id: int):
    obj = get_by_id(db, model, object_id)

    if not obj:
        return None

    try:
        db.delete(obj)
        db.commit()

        return obj

    except Exception:
        db.rollback()
        raise
