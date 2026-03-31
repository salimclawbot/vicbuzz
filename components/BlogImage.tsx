'use client';
export function BlogImage({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const keyword = (alt || '').toLowerCase();
  const getFallback = () => {
    if (keyword.includes('school holiday') || keyword.includes('children') || keyword.includes('kids'))
      return 'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg?auto=compress&cs=tinysrgb&w=800';
    if (keyword.includes('melbourne') || keyword.includes('victoria'))
      return 'https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800';
    if (keyword.includes('playground') || keyword.includes('park'))
      return 'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg?auto=compress&cs=tinysrgb&w=800';
    if (keyword.includes('beach') || keyword.includes('water'))
      return 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800';
    if (keyword.includes('museum') || keyword.includes('gallery') || keyword.includes('library'))
      return 'https://images.pexels.com/photos/1076758/pexels-photo-1076758.jpeg?auto=compress&cs=tinysrgb&w=800';
    if (keyword.includes('market') || keyword.includes('farm'))
      return 'https://images.pexels.com/photos/1508666/pexels-photo-1508666.jpeg?auto=compress&cs=tinysrgb&w=800';
    return 'https://images.pexels.com/photos/1001914/pexels-photo-1001914.jpeg?auto=compress&cs=tinysrgb&w=800';
  };
  return (
    <img
      src={src}
      alt={alt || ''}
      {...props}
      className='rounded-xl my-4 max-w-full h-auto block'
      style={{ maxWidth: '100%', height: 'auto' }}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        img.onerror = null;
        img.src = getFallback();
      }}
    />
  );
}
