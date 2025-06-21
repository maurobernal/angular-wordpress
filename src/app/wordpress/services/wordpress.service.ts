
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WpPost } from '@wordpress/types/wppost.type';


@Injectable({
  providedIn: 'root'
})
export class WordpressService {
  // Inject the HttpClient using the new `inject` function
  private http = inject(HttpClient);

  // Define the WordPress API endpoint URL.
  private readonly wordpressApiUrl = 'https://maurobernal.com.ar2/wp-json/wp/v2/posts';

  /**
   * Fetches a list of posts from the WordPress REST API.
   * @param params - Optional query parameters, e.g., { per_page: 10 }
   * @returns An Observable array of WpPost objects.
   */
  getPosts(params: { [param: string]: string | number } = {}): Observable<WpPost[]> {
    return this.http.get<WpPost[]>(this.wordpressApiUrl, { params });
  }
}