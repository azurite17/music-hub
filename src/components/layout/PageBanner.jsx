import musicBanner from '../../assets/musicBanner.jpg'

function PageBanner({ title, subtitle }) {
  return (
    <div className="feed-hero" style={{ backgroundImage: `url(${musicBanner})` }}>
      <div className="feed-hero-overlay">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

export default PageBanner
