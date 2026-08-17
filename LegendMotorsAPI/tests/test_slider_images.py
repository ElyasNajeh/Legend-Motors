import unittest

from PIL import Image, ImageDraw

from app.shared.images import (
    SLIDER_SUBJECT_MAX_WIDTH,
    SLIDER_SUBJECT_TARGET_HEIGHT,
    SubjectNotFoundError,
    prepare_slider_image,
)


class SliderImageProcessingTests(unittest.TestCase):
    def test_transparent_subject_is_trimmed_and_scaled_to_target_height(self):
        image = Image.new("RGBA", (1000, 700), (0, 0, 0, 0))
        ImageDraw.Draw(image).rectangle(
            (200, 250, 800, 550),
            fill=(120, 30, 20, 255),
        )

        result = prepare_slider_image(image)
        bounds = result.getchannel("A").getbbox()

        self.assertIsNotNone(bounds)
        assert bounds is not None
        self.assertLessEqual(result.height, SLIDER_SUBJECT_TARGET_HEIGHT)
        self.assertLessEqual(result.width, SLIDER_SUBJECT_MAX_WIDTH)
        self.assertEqual(bounds, (0, 0, result.width, result.height))

    def test_tall_subject_respects_max_height_without_distortion(self):
        image = Image.new("RGBA", (400, 1000), (0, 0, 0, 0))
        ImageDraw.Draw(image).rectangle(
            (100, 100, 300, 900),
            fill=(20, 80, 140, 255),
        )

        result = prepare_slider_image(image)
        bounds = result.getchannel("A").getbbox()

        self.assertIsNotNone(bounds)
        assert bounds is not None
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        self.assertEqual(height, SLIDER_SUBJECT_TARGET_HEIGHT)
        self.assertLessEqual(width, SLIDER_SUBJECT_MAX_WIDTH)
        self.assertAlmostEqual(width / height, 201 / 801, delta=0.01)

    def test_empty_transparent_image_is_rejected(self):
        image = Image.new("RGBA", (600, 400), (0, 0, 0, 0))

        with self.assertRaises(SubjectNotFoundError):
            prepare_slider_image(image)

if __name__ == "__main__":
    unittest.main()
