'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Flame, Quote } from 'lucide-react'
import { EXAM_DATE } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'

const MOTIVATIONAL_QUOTES = [
  "Mỗi ngày cố gắng một chút, bạn sẽ tiến gần hơn đến mục tiêu.",
  "Không cần phải giỏi ngay hôm nay, chỉ cần tốt hơn ngày hôm qua.",
  "Kiên trì hôm nay là nền tảng cho thành công ngày mai.",
  "Đừng sợ khó, hãy sợ mình bỏ cuộc quá sớm.",
  "Mỗi bài tập hoàn thành là một bước tiến gần hơn đến ước mơ.",
  "Tin vào bản thân, bạn có thể làm được nhiều hơn bạn nghĩ.",
  "Thành công không đến từ may mắn mà đến từ sự chuẩn bị.",
  "Hôm nay học một chút, ngày mai bạn sẽ cảm ơn chính mình.",
  "Không có con đường nào dẫn đến thành công mà không cần nỗ lực.",
  "Cứ tiến về phía trước, dù chỉ một bước mỗi ngày.",
  "Điểm số chỉ là kết quả, sự cố gắng mới là điều đáng tự hào.",
  "Bạn không cần hoàn hảo, bạn chỉ cần không ngừng tiến bộ.",
  "Mỗi lần vượt qua một bài khó là một lần bạn mạnh mẽ hơn.",
  "Đừng so sánh mình với người khác, hãy so sánh với chính mình của ngày hôm qua.",
  "Ước mơ càng lớn, nỗ lực càng cần bền bỉ.",
  "Một ngày học tập nghiêm túc hôm nay sẽ tạo nên tương lai tốt đẹp hơn.",
  "Đừng bỏ cuộc khi bạn còn chưa biết mình có thể đi xa đến đâu.",
  "Chậm cũng được, miễn là bạn vẫn đang tiến về phía trước.",
  "Hãy biến áp lực thành động lực để tiến lên.",
  "Mỗi phút tập trung hôm nay đều có giá trị cho ngày mai.",
  "Bạn đã đi được một chặng đường dài, hãy tiếp tục cố gắng.",
  "Không ai thành công ngay từ lần đầu tiên. Hãy tiếp tục thử.",
  "Khó khăn chỉ là thử thách trên con đường trưởng thành.",
  "Hãy học bằng sự tò mò và chinh phục bằng sự kiên trì.",
  "Ngày thi sẽ đến, hãy để hôm đó bạn tự hào về những gì mình đã làm.",
  "Đừng đợi có động lực mới bắt đầu. Hãy bắt đầu để tạo ra động lực.",
  "Mỗi ngày một chút, kiến thức sẽ trở thành sức mạnh.",
  "Bạn không cần biết toàn bộ con đường, chỉ cần bước tiếp bước tiếp theo.",
  "Cố gắng hôm nay chính là món quà bạn dành cho tương lai.",
  "Hãy tin rằng những ngày tháng nỗ lực của bạn sẽ có ý nghĩa.",
]

function getParts(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds }
}

export function CountdownCard() {
  const [parts, setParts] = useState(() => getParts(EXAM_DATE))
  const [quote, setQuote] = useState("")

  useEffect(() => {
    const randomIndex = Math.floor(
      Math.random() * MOTIVATIONAL_QUOTES.length
    )
    setQuote(MOTIVATIONAL_QUOTES[randomIndex])

    const id = setInterval(
      () => setParts(getParts(EXAM_DATE)),
      1000
    )

    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'Ngày', value: parts.days },
    { label: 'Giờ', value: parts.hours },
    { label: 'Phút', value: parts.minutes },
    { label: 'Giây', value: parts.seconds },
  ]

  return (
    <Card className="relative overflow-hidden border-sidebar-border bg-sidebar p-5 text-sidebar-foreground sm:p-6">
      {/* Hiệu ứng ánh sáng nền theo màu primary */}
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Khối bên trái: Icon + Tiêu đề + Quote */}
        <div className="flex items-start gap-3.5">
          {/* Badge Icon Lịch hình tròn nền vàng chữ tối giống hệt nút giao diện mẫu */}
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
            <CalendarClock className="size-5 stroke-[2.5]" />
          </span>

          <div className="space-y-1.5">
            {/* Tiêu đề dùng màu text-primary */}
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-primary sm:text-lg">
                Đếm ngược kỳ thi tốt nghiệp THPT 2027
              </h3>
              <Flame className="size-5 text-primary animate-pulse shrink-0" />
            </div>

            {/* Ngày thi */}
            <p className="text-xs font-semibold text-sidebar-foreground/70 sm:text-sm">
              Ngày thi chính thức: <span className="text-primary font-bold">11 tháng 6 năm 2027</span>
            </p>

            {/* Khối Trích dẫn động lực */}
            {quote && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/10 p-3 border-l-2 border-primary max-w-xl">
                <Quote className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs font-bold italic leading-relaxed text-primary sm:text-sm">
                  "{quote}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Khối bên phải: Bộ đếm thời gian */}
        <div className="grid grid-cols-4 gap-2 shrink-0 sm:gap-3">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex min-w-[62px] flex-col items-center justify-center rounded-2xl bg-sidebar-accent/80 border border-sidebar-border/50 px-2 py-2.5 shadow-sm sm:min-w-[70px] sm:py-3"
            >
              <span className="font-mono text-2xl font-black tabular-nums text-primary sm:text-3xl">
                {String(u.value).padStart(2, '0')}
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/60">
                {u.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}