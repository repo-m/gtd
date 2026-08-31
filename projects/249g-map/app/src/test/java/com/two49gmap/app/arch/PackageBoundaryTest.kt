package com.two49gmap.app.arch

import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * Layer 5 (structural). Enforces the package boundary rule from
 * `00-system-architecture.md`: "ui.* depends only on domain; data.* depends only on
 * domain ... domain depends on nothing Android-specific."
 *
 * Concretely:
 *  - `domain/` has zero `android.*` imports.
 *  - `ui/` has zero `data.*` imports (must go through `domain` instead).
 */
class PackageBoundaryTest {

    private val androidImport = Regex("""^\s*import\s+android\..*""")
    private val dataImport = Regex("""^\s*import\s+com\.two49gmap\.app\.data\..*""")

    @Test
    fun `domain package has zero android imports`() {
        val offenders = kotlinFilesIn("domain").flatMap { file ->
            offendingLines(file, androidImport)
        }
        assertTrue(
            "domain/ must not import android.*, found:\n${offenders.joinToString("\n")}",
            offenders.isEmpty()
        )
    }

    @Test
    fun `ui package has zero data imports`() {
        val offenders = kotlinFilesIn("ui").flatMap { file ->
            offendingLines(file, dataImport)
        }
        assertTrue(
            "ui/ must not import com.two49gmap.app.data.*, found:\n${offenders.joinToString("\n")}",
            offenders.isEmpty()
        )
    }

    private fun offendingLines(file: File, pattern: Regex): List<String> =
        file.readLines()
            .filter { pattern.matches(it) }
            .map { "${file.path}: $it" }

    private fun kotlinFilesIn(packageName: String): List<File> {
        val dir = mainJavaRoot().resolve("com/two49gmap/app/$packageName")
        if (!dir.exists()) return emptyList()
        return dir.walkTopDown().filter { it.isFile && it.extension == "kt" }.toList()
    }

    /** Locates `app/src/main/java`, whether Gradle runs tests from the module dir or the root. */
    private fun mainJavaRoot(): File {
        val candidates = listOf(
            File("src/main/java"),
            File("app/src/main/java"),
            File("../app/src/main/java")
        )
        return candidates.firstOrNull { it.exists() }
            ?: error("Could not locate app/src/main/java from working dir ${File(".").absolutePath}")
    }
}
