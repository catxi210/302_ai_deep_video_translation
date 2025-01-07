export function useProxyImage() {
  const getProxyUrl = (url: string) => {
    if (!url) return "";
    return `/api/302/vt/image/proxy?url=${encodeURIComponent(url)}`;
  };

  return {
    getProxyUrl,
  };
}
