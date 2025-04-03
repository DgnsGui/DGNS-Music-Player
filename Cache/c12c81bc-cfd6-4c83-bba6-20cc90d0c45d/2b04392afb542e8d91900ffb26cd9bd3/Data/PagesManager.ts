import { PinchButton } from 'SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';
import { InteractorEvent } from 'SpectaclesInteractionKit/Core/Interactor/InteractorEvent';

@component
export class PageManager extends BaseScriptComponent {
    // Input references for buttons
    @input('Component.ScriptComponent')
    nextButton: PinchButton;

    @input('Component.ScriptComponent')
    prevButton: PinchButton;

    // Input references for text
    @input('Component.Text')
    pageNumberText: Text;

    // Input references for pages
    @input('SceneObject')
    page0: SceneObject;

    @input('SceneObject')
    page1: SceneObject;

    @input('SceneObject')
    page2: SceneObject;

    @input('SceneObject')
    page3: SceneObject;

    private currentPageIndex: number = 0;
    private pages: SceneObject[] = [];

    onAwake() {
        // Initialize pages array with the input references
        this.pages = [this.page0, this.page1, this.page2, this.page3].filter(page => page != null);

        // Hide all pages except the first one
        this.pages.forEach((page, index) => {
            page.enabled = index === 0;
        });

        // Set up next button
        if (this.nextButton) {
            this.nextButton.onButtonPinched.add((event: InteractorEvent) => {
                this.navigateToNextPage();
            });
        } else {
            print("Warning: Next button not assigned");
        }

        // Set up previous button
        if (this.prevButton) {
            this.prevButton.onButtonPinched.add((event: InteractorEvent) => {
                this.navigateToPreviousPage();
            });
        } else {
            print("Warning: Previous button not assigned");
        }

        // Initialize page number text
        this.updatePageNumberText();
    }

    private navigateToNextPage(): void {
        if (this.currentPageIndex < this.pages.length - 1) {
            // Hide current page
            this.pages[this.currentPageIndex].enabled = false;
            // Show next page
            this.currentPageIndex++;
            this.pages[this.currentPageIndex].enabled = true;
            this.updatePageNumberText();
        }
    }

    private navigateToPreviousPage(): void {
        if (this.currentPageIndex > 0) {
            // Hide current page
            this.pages[this.currentPageIndex].enabled = false;
            // Show previous page
            this.currentPageIndex--;
            this.pages[this.currentPageIndex].enabled = true;
            this.updatePageNumberText();
        }
    }

    private updatePageNumberText(): void {
        if (this.pageNumberText) {
            // Affiche simplement le numéro de 1 à 4
            this.pageNumberText.text = (this.currentPageIndex + 1).toString();
        }
    }
}