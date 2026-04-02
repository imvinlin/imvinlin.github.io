import Shell from '../../components/Shell';
import { getAllPosts } from '../../lib/markdown';

export default async function BlogPage() {
  const posts = await getAllPosts();
  return <Shell posts={posts} />;
}