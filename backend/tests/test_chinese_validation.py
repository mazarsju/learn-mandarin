import bootstrap  # noqa: F401
import unittest

from backend.chinese_validation import (
    extract_han_characters,
    is_han_character,
    is_han_text,
)


class TestChineseValidation(unittest.TestCase):
    def test_is_han_character(self):
        self.assertTrue(is_han_character("爱"))
        self.assertFalse(is_han_character("a"))
        self.assertFalse(is_han_character("爱好"))

    def test_is_han_text(self):
        self.assertTrue(is_han_text("爱好"))
        self.assertFalse(is_han_text("hello"))
        self.assertFalse(is_han_text("爱a"))

    def test_extract_han_characters(self):
        self.assertEqual(extract_han_characters("Hello 爱好!"), {"爱", "好"})
        self.assertEqual(extract_han_characters("abc"), set())


if __name__ == "__main__":
    unittest.main()
