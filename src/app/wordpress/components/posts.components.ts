
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpPost } from '@wordpress/types/wppost.type';
import { WordpressService } from '@wordpress/services/wordpress.service';

@Component({
  selector: 'app-posts',
  imports: [CommonModule], // Import CommonModule for directives like *ngFor
  templateUrl: './posts.components.html',
  // No styleUrl is needed as we are using Tailwind CSS utility classes directly in the template.
})
export class PostsComponent implements OnInit {
  // Inject the WordPress service
  private wordpressService = inject(WordpressService);

  // Define signals for managing state: posts, loading, and errors.
  public posts: WritableSignal<WpPost[]> = signal([]);
  public isLoading: WritableSignal<boolean> = signal(true);
  public error: WritableSignal<string | null> = signal(null);

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.wordpressService.getPosts({ per_page: 6 }).subscribe({
      next: (data) => {
        this.posts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching WordPress posts:', err);
        this.error.set('Failed to load posts. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }
}