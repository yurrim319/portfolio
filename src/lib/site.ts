export const SITE = {
  name: 'yurim',
  email: 'yurim319@afun-interactive.com',
};

// import.meta.env.BASE_URL은 astro.config.mjs의 base 설정에 따라 끝에 슬래시가
// 없을 수 있다("/portfolio"). 항상 트레일링 슬래시를 보장해 `${BASE}about` 같은
// 조합이 "/portfolioabout"으로 깨지지 않게 한다.
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
