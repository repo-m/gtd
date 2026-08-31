package com.two49gmap.app

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.assertIsDisplayed
import org.junit.Rule
import org.junit.Test

/**
 * Layer 4 (instrumented). Launches `MainActivity` and asserts the title bar reads
 * exactly "249g-map", per `PROMPT.md` acceptance criterion 5.
 */
class MainActivityTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun titleBar_displaysAppName() {
        composeTestRule.onNodeWithText("249g-map").assertIsDisplayed()
    }
}
