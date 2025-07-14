
import { Page } from "playwright";

export abstract class SearchPageBase {
    protected readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }

    abstract selectMenCategory(): Promise<void>;
    abstract searchForItem(item: string): Promise<any>;



}