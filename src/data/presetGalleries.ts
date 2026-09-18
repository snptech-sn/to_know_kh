export interface PresetGalleryAlbum {
  id: string;
  nameKm: string;
  nameEn: string;
  category: string;
  images: string[];
}

export const PRESET_GALLERY_ALBUMS: PresetGalleryAlbum[] = [
  {
    id: 'album-ai-tech',
    nameKm: 'បច្ចេកវិទ្យា AI & មនុស្សយន្ត',
    nameEn: 'AI & Robotics Tech',
    category: 'បច្ចេកវិទ្យា',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'album-space-science',
    nameKm: 'លំហអាកាស និងកាឡាក់ស៊ី',
    nameEn: 'Cosmos & Galaxy',
    category: 'វិទ្យាសាស្ត្រ',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?w=1000&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'album-nature-earth',
    nameKm: 'ធម្មជាតិ និងផែនដី',
    nameEn: 'Earth & Nature',
    category: 'ចំណេះដឹងទូទៅ',
    images: [
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'album-history-angkor',
    nameKm: 'ប្រវត្តិសាស្ត្រ និងបេតិកភណ្ឌ',
    nameEn: 'History & Heritage',
    category: 'ប្រវត្តិសាស្ត្រ',
    images: [
      'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?w=1000&auto=format&fit=crop&q=80',
    ],
  },
];
