from flask import Flask


def register_routes(app: Flask) -> None:
    from backend.routes import (
        bulk_characters,
        chat,
        create_character,
        create_word,
        delete_character,
        delete_word,
        health,
        list_characters,
        list_words,
        llm_config,
        update_character,
        update_word,
    )

    app.register_blueprint(health.bp)
    app.register_blueprint(chat.bp)
    app.register_blueprint(llm_config.bp)
    app.register_blueprint(list_characters.bp)
    app.register_blueprint(create_character.bp)
    app.register_blueprint(delete_character.bp)
    app.register_blueprint(update_character.bp)
    app.register_blueprint(list_words.bp)
    app.register_blueprint(create_word.bp)
    app.register_blueprint(update_word.bp)
    app.register_blueprint(delete_word.bp)
    app.register_blueprint(bulk_characters.bp)
