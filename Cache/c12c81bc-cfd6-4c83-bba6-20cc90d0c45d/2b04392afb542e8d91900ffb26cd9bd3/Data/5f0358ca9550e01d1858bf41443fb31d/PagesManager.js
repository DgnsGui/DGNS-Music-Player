"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageManager = void 0;
var __selfType = requireType("./PagesManager");
function component(target) { target.getTypeName = function () { return __selfType; }; }
let PageManager = class PageManager extends BaseScriptComponent {
    onAwake() {
        // Initialize pages array with the input references
        this.pages = [this.page0, this.page1, this.page2, this.page3].filter(page => page != null);
        // Hide all pages except the first one
        this.pages.forEach((page, index) => {
            page.enabled = index === 0;
        });
        // Set up next button
        if (this.nextButton) {
            this.nextButton.onButtonPinched.add((event) => {
                this.navigateToNextPage();
            });
        }
        else {
            print("Warning: Next button not assigned");
        }
        // Set up previous button
        if (this.prevButton) {
            this.prevButton.onButtonPinched.add((event) => {
                this.navigateToPreviousPage();
            });
        }
        else {
            print("Warning: Previous button not assigned");
        }
        // Initialize page number text
        this.updatePageNumberText();
    }
    navigateToNextPage() {
        if (this.currentPageIndex < this.pages.length - 1) {
            // Hide current page
            this.pages[this.currentPageIndex].enabled = false;
            // Show next page
            this.currentPageIndex++;
            this.pages[this.currentPageIndex].enabled = true;
            this.updatePageNumberText();
        }
    }
    navigateToPreviousPage() {
        if (this.currentPageIndex > 0) {
            // Hide current page
            this.pages[this.currentPageIndex].enabled = false;
            // Show previous page
            this.currentPageIndex--;
            this.pages[this.currentPageIndex].enabled = true;
            this.updatePageNumberText();
        }
    }
    updatePageNumberText() {
        if (this.pageNumberText) {
            // Affiche simplement le numéro de 1 à 4
            this.pageNumberText.text = (this.currentPageIndex + 1).toString();
        }
    }
    __initialize() {
        super.__initialize();
        this.currentPageIndex = 0;
        this.pages = [];
    }
};
exports.PageManager = PageManager;
exports.PageManager = PageManager = __decorate([
    component
], PageManager);
//# sourceMappingURL=PagesManager.js.map