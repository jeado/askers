import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';
import { UserInfo } from '../../auth/user';
import { Channel } from '../../channel/channel';
import { Post } from '../post';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  user: UserInfo;
  channel: Channel;
  newPost: Post;
  posts$: Observable<Post[]>;
  isChannelOwner = false;
  sort: FormControl;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private clipboardService: ClipboardService
  ) { }

ngOnInit() {
  this.user = this.route.snapshot.data.user;
  this.sort = new FormControl('favoriteCount');

  const channel$ = this.route.data.pipe(
    map(data => data['channel']),
    filter(channel => !this.channel || channel.id !== this.channel.id)
  ).subscribe(channel => { // TODO refactoring
    this.channel = channel;
    this.postService.getNewPost(this.channel.id).subscribe(post => this.newPost = post);
    this.posts$ = this.postService.getPostByChannelId(this.channel.id, this.sort.value);
    this.isChannelOwner = this.channel.userRef.uid === this.user.uid;
  });

  this.sort.valueChanges.subscribe(sort => {
    this.posts$ = this.postService.getPostByChannelId(this.channel.id, sort);
  });
 }

  share() {
    this.clipboardService.copyFromContent(`https://askers.io/channels/${this.channel.code}`);
    alert('The URL is Copied to clipboard');
  }

  onSubmitPost() {
    this.postService.getNewPost(this.channel.id).subscribe(post => this.newPost = post);
  }

}
