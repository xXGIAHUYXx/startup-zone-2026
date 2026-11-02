import React from 'react';
import { DEMO_WORKSHOPS } from '../../data/mockData';
import { Card } from '../common/Card';
import { Flame, MapPin } from 'lucide-react';
import { DragCarousel } from '../common/DragCarousel';

export const ArtisanNetworkSection: React.FC = () => {
  return (
    <section id="artisans" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[15px] font-medium text-[#0071e3] block mb-2">Nghệ nhân & xưởng gốm</span>
        <h2 className="font-heritage text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1d1d1f] mb-3">
          Những người giữ lửa tại Bát Tràng
        </h2>
        <p className="text-sm sm:text-base text-[#6e6e73] leading-relaxed">
          Chúng tôi hợp tác trực tiếp với các thợ gốm và xưởng gia truyền tại làng nghề Bát Tràng (Gia Lâm, Hà Nội) để đảm bảo chất lượng chế tác nguyên bản nhất.
        </p>
      </div>

      {/* Workshop Grid */}
      <DragCarousel itemClassName="w-[17.5rem] sm:w-[19rem]">
        {DEMO_WORKSHOPS.map((workshop) => (
          <Card key={workshop.id} hoverable className="flex flex-col justify-between p-5 bg-white h-full">
            <div>
              {/* Image */}
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-[#e8e8ed]">
                <img
                  src={workshop.avatar}
                  alt={workshop.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2.5 right-2.5 bg-[#000000]/85 backdrop-blur-xs text-white text-[11px] px-2.5 py-0.5 rounded-full font-mono">
                  Bát Tràng
                </span>
              </div>

              {/* Title & Leader */}
              <h4 className="font-heritage text-lg font-semibold text-[#1d1d1f] line-clamp-1 mb-1">
                {workshop.name.replace('[DEMO] ', '')}
              </h4>
              <p className="text-xs font-semibold text-[#0071e3] mb-1">
                {workshop.artisanLeader.replace(' (Đại diện mô phỏng)', '')}
              </p>
              <p className="text-xs text-[#6e6e73] mb-3 leading-snug">
                {workshop.generation}
              </p>

              {/* Specialties */}
              <div className="mb-4">
                <span className="text-[11px] uppercase tracking-wider text-[#86868b] block mb-1.5 font-medium">
                  Thế mạnh chế tác:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {workshop.specialty.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#f5f5f7] text-[#424245] px-2.5 py-1 rounded-md border border-[#e8e8ed]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Location */}
            <div className="pt-3 border-t border-[#e8e8ed] space-y-1.5 text-xs text-[#6e6e73]">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#0071e3] shrink-0" />
                <span className="truncate">{workshop.villageArea.replace(', Hà Nội', '')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-[#1d1d1f] shrink-0" />
                <span className="truncate">{workshop.kilnType}</span>
              </div>
            </div>
          </Card>
        ))}
      </DragCarousel>

    </section>
  );
};
