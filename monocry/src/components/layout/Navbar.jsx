export default function AdUnit({ className = '' }) {
  return (
    <div className={`w-full ${className}`} aria-label="Advertisement">
      {/* BEGIN AADS AD UNIT 2437881 */}
      <div id="frame" style={{ width: '100%', margin: 'auto', position: 'relative', zIndex: 99998 }}>
        <iframe
          data-aa="2437881"
          src="//acceptable.a-ads.com/2437881/?size=Adaptive"
          style={{
            border: 0,
            padding: 0,
            width: '70%',
            height: 'auto',
            overflow: 'hidden',
            display: 'block',
            margin: 'auto'
          }}
          title="Advertisement"
          loading="lazy"
        />
      </div>
      {/* END AADS AD UNIT 2437881 */}
    </div>
  )
}
