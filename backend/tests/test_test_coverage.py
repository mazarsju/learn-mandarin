import bootstrap  # noqa: F401
import json
import subprocess
import sys
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from backend.test_coverage import ROOT, main, write_summary


class TestWriteSummary(unittest.TestCase):
    def test_write_summary_uses_branch_percent_when_available(self):
        coverage_json = {
            "totals": {
                "covered_lines": 80,
                "missing_lines": 20,
                "percent_statements_covered": 75.5,
                "percent_branches_covered": 60.25,
            }
        }

        with TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            input_path = temp_path / "coverage.json"
            output_path = temp_path / "coverage-summary.json"
            input_path.write_text(json.dumps(coverage_json))

            write_summary(input_path, output_path)

            summary = json.loads(output_path.read_text())
            self.assertEqual(
                summary,
                {
                    "total": {
                        "lines": {"pct": 80.0},
                        "statements": {"pct": 75.5},
                        "branches": {"pct": 60.25},
                        "functions": {"pct": 75.5},
                    }
                },
            )

    def test_write_summary_computes_branches_from_counts(self):
        coverage_json = {
            "totals": {
                "covered_lines": 10,
                "missing_lines": 0,
                "percent_covered": 88.0,
                "num_branches": 8,
                "covered_branches": 6,
            }
        }

        with TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            input_path = temp_path / "coverage.json"
            output_path = temp_path / "coverage-summary.json"
            input_path.write_text(json.dumps(coverage_json))

            write_summary(input_path, output_path)

            summary = json.loads(output_path.read_text())
            self.assertEqual(summary["total"]["branches"]["pct"], 75.0)
            self.assertEqual(summary["total"]["statements"]["pct"], 88.0)

    def test_write_summary_defaults_branches_when_missing(self):
        coverage_json = {
            "totals": {
                "covered_lines": 4,
                "missing_lines": 1,
                "percent_covered": 70.0,
            }
        }

        with TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            input_path = temp_path / "coverage.json"
            output_path = temp_path / "coverage-summary.json"
            input_path.write_text(json.dumps(coverage_json))

            write_summary(input_path, output_path)

            summary = json.loads(output_path.read_text())
            self.assertEqual(summary["total"]["branches"]["pct"], 100.0)
            self.assertEqual(summary["total"]["lines"]["pct"], 80.0)

    def test_write_summary_handles_zero_total_lines(self):
        coverage_json = {
            "totals": {
                "covered_lines": 0,
                "missing_lines": 0,
                "percent_statements_covered": 0.0,
                "percent_branches_covered": 0.0,
            }
        }

        with TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            input_path = temp_path / "coverage.json"
            output_path = temp_path / "coverage-summary.json"
            input_path.write_text(json.dumps(coverage_json))

            write_summary(input_path, output_path)

            summary = json.loads(output_path.read_text())
            self.assertEqual(summary["total"]["lines"]["pct"], 100.0)


class TestMain(unittest.TestCase):
    @patch("backend.test_coverage.write_summary")
    @patch("backend.test_coverage.subprocess.run")
    def test_main_runs_coverage_pipeline(self, mock_run, mock_write_summary):
        with TemporaryDirectory() as temp_dir:
            coverage_dir = Path(temp_dir) / "coverage"

            with patch("backend.test_coverage.COVERAGE_DIR", coverage_dir):
                result = main()

            self.assertEqual(result, 0)
            self.assertEqual(mock_run.call_count, 3)

            run_command = mock_run.call_args_list[0].args[0]
            self.assertEqual(
                run_command,
                [
                    sys.executable,
                    "-m",
                    "coverage",
                    "run",
                    "-m",
                    "unittest",
                    "discover",
                    "-s",
                    "backend/tests",
                    "-v",
                ],
            )
            self.assertEqual(mock_run.call_args_list[0].kwargs["cwd"], ROOT)
            self.assertTrue(mock_run.call_args_list[0].kwargs["check"])

            self.assertEqual(
                mock_run.call_args_list[1].args[0],
                [sys.executable, "-m", "coverage", "html"],
            )
            self.assertEqual(
                mock_run.call_args_list[2].args[0],
                [
                    sys.executable,
                    "-m",
                    "coverage",
                    "json",
                    "-o",
                    str(coverage_dir / "coverage.json"),
                ],
            )

            mock_write_summary.assert_called_once_with(
                coverage_dir / "coverage.json",
                coverage_dir / "coverage-summary.json",
            )
            self.assertTrue(coverage_dir.exists())

    @patch("backend.test_coverage.subprocess.run")
    def test_main_propagates_subprocess_errors(self, mock_run):
        mock_run.side_effect = subprocess.CalledProcessError(1, ["coverage"])

        with self.assertRaises(subprocess.CalledProcessError):
            main()


if __name__ == "__main__":
    unittest.main()
