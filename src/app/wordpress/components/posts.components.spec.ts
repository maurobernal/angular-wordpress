import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { PostsComponent } from './posts.components';
import { WordpressService } from '@wordpress/services/wordpress.service';
import { WpPost } from '@wordpress/types/wppost.type';
import { CommonModule } from '@angular/common';

// Mock data for WpPost
const mockPosts: WpPost[] = [
  {
    id: 1,
    date: new Date(),
    link: 'https://example.com/post1',
    title: { rendered: 'Post 1 Title' },
    content: { rendered: '<p>Post 1 content.</p>', protected: false },
    excerpt: { rendered: '<p>Post 1 excerpt.</p>', protected: false },
  },
  {
    id: 2,
    date: new Date(),
    link: 'https://example.com/post2',
    title: { rendered: 'Post 2 Title' },
    content: { rendered: '<p>Post 2 content.</p>', protected: false },
    excerpt: { rendered: '<p>Post 2 excerpt.</p>', protected: false },
  },
];

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;
  let wordpressService: WordpressService;

  // Spy for WordpressService.getPosts
  let getPostsSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule, // Import CommonModule as it's used in PostsComponent
        HttpClientTestingModule, // For mocking HTTP requests if WordpressService wasn't mocked directly
        PostsComponent, // Import the standalone component directly
      ],
      providers: [
        WordpressService, // Provide the actual service, we will spy on its methods
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    wordpressService = TestBed.inject(WordpressService); // Get the service instance

    // Spy on wordpressService.getPosts before each test
    getPostsSpy = spyOn(wordpressService, 'getPosts').and.returnValue(of(mockPosts));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have isLoading initially true', () => {
      // ngOnInit is called automatically on creation for standalone components with TestBed.createComponent
      // However, the isLoading is set to true at the beginning of loadPosts, which is called by ngOnInit.
      // To test the state *before* loadPosts (or its async operations) might complete,
      // we can check the state immediately after component creation.
      // But since loadPosts is called in ngOnInit, isLoading might have already been flipped by the time we check,
      // if the mocked service responds synchronously.
      // For this component, isLoading is true upon declaration, and then set true again in loadPosts.
      expect(component.isLoading()).toBe(true);
    });

    it('should have posts initially as an empty array', () => {
      // Similar to isLoading, posts is initialized as empty.
      // ngOnInit will trigger loadPosts, which might populate it.
      // We are checking the declared state.
      expect(component.posts()).toEqual([]);
    });

    it('should have error initially as null', () => {
      // error is initialized as null.
      expect(component.error()).toBeNull();
    });

    it('should call loadPosts on init', () => {
      // ngOnInit is called by fixture.detectChanges() or component creation.
      // We need to ensure getPostsSpy was set up before ngOnInit runs.
      // The spy is set up in beforeEach, and then component is created.
      // We can call fixture.detectChanges() to trigger ngOnInit if it hasn't run or to update the view.
      fixture.detectChanges(); // Triggers ngOnInit if not already called, or re-evaluates bindings
      expect(getPostsSpy).toHaveBeenCalled();
    });
  });

  describe('loadPosts method', () => {
    it('should load posts successfully', () => {
      getPostsSpy.and.returnValue(of(mockPosts)); // Ensure spy returns mock posts

      // ngOnInit already called loadPosts. To re-test loadPosts or test it in isolation,
      // you might call it directly. However, standard practice is to test component methods
      // as they are called by the component's lifecycle or user interaction.
      // Since ngOnInit calls loadPosts, we'll check the state after ngOnInit has processed the response.
      fixture.detectChanges(); // Process the async response from getPosts

      expect(component.isLoading()).toBe(false);
      expect(component.posts()).toEqual(mockPosts);
      expect(component.error()).toBeNull();
      expect(getPostsSpy).toHaveBeenCalledWith({ per_page: 6 });
    });

    it('should handle error when loading posts', () => {
      const errorResponse = { status: 500, statusText: 'Server Error' };
      getPostsSpy.and.returnValue(throwError(() => errorResponse));

      // Call ngOnInit or trigger the action that calls loadPosts
      // In this case, PostsComponent calls loadPosts in ngOnInit.
      // If fixture.detectChanges() was already called in beforeEach or another test,
      // and you need to re-trigger with a different spy behavior,
      // you might need to call component.ngOnInit() directly or re-initialize the component for isolation.
      // For simplicity, we assume ngOnInit is the trigger.
      // We need to ensure this spy setup is effective *before* loadPosts is called.
      // Since component is created in beforeEach, ngOnInit is called there.
      // We need to re-call or re-trigger loadPosts.
      // Let's reset the component's state and call loadPosts directly for this test.

      component.posts.set([]); // Reset state
      component.isLoading.set(true);
      component.error.set(null);

      // Call the method directly to test its behavior with the new spy return value
      (component as any).loadPosts(); // Use type assertion to access private method if needed for test
      fixture.detectChanges(); // Process the async error response

      expect(component.isLoading()).toBe(false);
      expect(component.posts()).toEqual([]);
      expect(component.error()).toBe('Failed to load posts. Please try again later.');
      expect(getPostsSpy).toHaveBeenCalledWith({ per_page: 6 });
    });
  });

  describe('Template Rendering', () => {
    it('should display loading state', () => {
      component.isLoading.set(true);
      component.error.set(null);
      component.posts.set([]);
      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.text-gray-500');
      expect(loadingElement).toBeTruthy();
      expect(loadingElement.textContent).toContain('Loading posts...');
      // Ensure no error or posts are shown
      expect(fixture.nativeElement.querySelector('.bg-red-100')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.grid')).toBeFalsy();
    });

    it('should display error state', () => {
      const errorMessage = 'Test error message';
      component.isLoading.set(false);
      component.error.set(errorMessage);
      component.posts.set([]);
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.bg-red-100');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Error');
      expect(errorElement.textContent).toContain(errorMessage);
      // Ensure no loading or posts are shown
      expect(fixture.nativeElement.querySelector('p.text-gray-500:not(.col-span-full)')).toBeFalsy(); // Exclude "No posts found"
      expect(fixture.nativeElement.querySelector('.grid')).toBeFalsy();
    });

    it('should display posts when loaded successfully', () => {
      component.isLoading.set(false);
      component.error.set(null);
      component.posts.set(mockPosts);
      fixture.detectChanges();

      const postElements = fixture.nativeElement.querySelectorAll('.grid > div');
      expect(postElements.length).toBe(mockPosts.length);

      mockPosts.forEach((post, index) => {
        const postElement = postElements[index];
        expect(postElement.querySelector('h2').innerHTML).toBe(post.title.rendered);
        expect(postElement.querySelector('.text-gray-600.text-sm').innerHTML).toBe(post.excerpt.rendered);
        expect(postElement.querySelector('a').href).toBe(post.link);
      });
      // Ensure no loading or error messages are shown
      expect(fixture.nativeElement.querySelector('p.text-gray-500:not(.col-span-full)')).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.bg-red-100')).toBeFalsy();
    });

    it('should display "No posts found" when no posts are available and not loading or error', () => {
      component.isLoading.set(false);
      component.error.set(null);
      component.posts.set([]); // Empty posts
      fixture.detectChanges();

      const noPostsElement = fixture.nativeElement.querySelector('p.text-gray-500.col-span-full');
      expect(noPostsElement).toBeTruthy();
      expect(noPostsElement.textContent).toContain('No posts found.');
      // Ensure no loading or error messages are shown
      const loadingElement = fixture.nativeElement.querySelector('div.text-center > p.text-gray-500:not(.col-span-full)');
      expect(loadingElement).toBeFalsy();
      expect(fixture.nativeElement.querySelector('.bg-red-100')).toBeFalsy();
    });
  });
});
