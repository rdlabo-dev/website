import { Routes } from '@angular/router';

import { articleResolver } from './articles/article.resolver';
import { ArticlePage } from './pages/articles/article-page';
import { ArticlesPage } from './pages/articles/articles-page';
import { HomePage } from './pages/home/home-page';
import { NotFoundPage } from './pages/not-found/not-found-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    title: 'rdlabo.dev — Engineering notes and open source for application teams',
  },
  {
    path: 'articles',
    component: ArticlesPage,
  },
  {
    path: 'articles/archive/:year',
    component: ArticlesPage,
  },
  {
    path: 'articles/:slug',
    component: ArticlePage,
    resolve: { article: articleResolver },
  },
  { path: 'not-found', component: NotFoundPage },
  {
    path: '**',
    component: NotFoundPage,
  },
];
