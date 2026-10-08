const MAPS_URL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyChMaHhqI42AeeqrFsWv0PTpA_YRu8P0CI&libraries=places';

let loading = null;

// Note: the Maps script is only needed on the country pages, loading it on
// demand keeps it from blocking the first render of every other page
export const loadGoogleMaps = () => {
  if (window.google && window.google.maps) return Promise.resolve(window.google.maps);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = MAPS_URL;
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = (e) => {
        // allow a retry on the next call
        loading = null;
        script.remove();
        reject(e);
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}
