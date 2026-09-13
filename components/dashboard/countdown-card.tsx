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
  "Khi tham vọng của bạn càng lớn thì bản thân càng phải thật kiên cường.",
  "Ba mẹ không đầu tư để lấy lại tiền. Họ đầu tư để em không phải sống lại cuộc đời vất vả mà họ đã sống",
  "Khi bạn đủ lì, khó khăn cũng phải nhường đường.",
  "Sống to gan lên một chút, bạn không có nhiều khán giả tới vậy đâu.",
  "Không cho phép bản thân trở thành một người tầm thường vì vốn dĩ bạn là đứa trẻ có mục tiêu, có tham vọng.",
  "Khi bạn không chịu nổi khổ của việc kỉ luật thì phải chịu nổi khổ của việc tự ti.",
  "Có những con đường bạn sẽ phải đi một mình. Trời sẽ rất tối, gió sẽ rất lớn.",
  "Nó không khó, nó chỉ mới thôi.",
  "Cái gì không làm được thì vừa khóc vừa làm.",
  "Đừng ghét bản thân ở những ngày chưa giỏi giang.",
  "Khi bạn càng nghiêm túc với việc học và mục tiêu của mình, thì vũ trụ cũng sẽ nghiêm túc với ước mơ của bạn",
  "Sống là phải ráng, ráng học, ráng làm. Vì ráng mới có rạng.",
  "Dám đặt mục tiêu cao thì cũng phải chấp nhận trả giá bằng sự cố gắng gấp nhiều lần. Không có chuyện mơ lớn mà làm qua loa.",
  "Sức mạnh lớn nhất của tuổi trẻ là biến những điều ‘không thể’ thành những cột mốc chói lọi trong lịch sử của chính mình.",
  "Hãy đầu tư vào bản thân. Không ai có thể lấy đi những gì bạn đã học được",
  "Bạn chỉ có thể thấy mình thất bại chứ không thể thấy mình bỏ cuộc.",
  "Bạn định nói với ‘đứa trẻ’ kiên cường đó rằng: ‘Xịn lỗi, tôi không chiụ nổi nữa sao?’",
  "Chấp nhận không thoải mái trong vài năm, để có thể sống thoải mái phần đời còn lại.",
  "Sao không thử một lần cố gắng hết sức để xem bản thân có thể xuất sắc đến đâu?",
  "Mạnh dạn đặt mục tiêu lớn một chút. Cùng lắm là phải học nhiều hơn.",
  "Vạn lần xin bản thân đừng bỏ cuộc.",
  "Trận cuối rồi, mong em dốc toàn lực mà đánh.",
  "Mong bạn sẽ nỗ lực thật nhiều. Không phải để chứng minh cho ai, mà vì nơi bạn muốn đến, vì người bạn muốn trở thành.",
  "Học không chỉ để kiếm tiền. Học để có tiếng nói, có giá trị, có vị trí và được tôn trọng.",
  "Khi năng lực chưa đủ gánh vác ước mơ. Điều duy nhất bạn nên làm là im lặng và tiếp tục mài giũa bản thân.",
  "Trước khi xuất sắc, bạn phải làm cho tốt. Trước khi làm tốt, bạn phải chấp nhận mình tệ. Và trước khi làm tệ, hãy cho phép mình chưa giỏi.",
 "Tri thức sẽ đưa bạn đến nơi rực rỡ nhất, trở thành phiên bản mà bạn luôn hướng tới。",
 "Cứ học hỏi, dám sai, dám sửa. Vì không ai giỏi ngay từ đầu, và cũng chẳng có đóa hoa nào nở rộ chỉ sau một đêm。",
 "Tôi muốn trở thành một người mà chính mình cũng phải rung động。",
 "Có tri thức, có dũng khí, có cốt cách, biết nhiều hiểu rộng, tử tế lương thiện。",
 "Nói được làm được, chăm chỉ cầu tiến。",
 "Học tập là cách duy nhất để bạn có thể ngồi đàm phán với những người giỏi, thay vì chỉ đứng dưới nhìn lên và vỗ tay cho họ。",
 "Muốn đạt được thứ gì đó, thì phải làm. Không phải nghĩ, không phải than. Mệt cũng phải làm, sợ cũng phải làm. Mọi thứ đều có giá của nó, nếu miễn phí thì ai cũng có rồi。",
 "Việc của bạn bây giờ là học, nâng cấp bản thân và tích lũy kinh nghiệm. Tương lai của bạn chỉ có bạn biết. Thứ bạn muốn chỉ có thể tự bạn dành lấy。",
 "Đã đến lúc đưa bản thân quay trở về quỹ đạo。",
 "Không có sự lựa chọn ĐÚNG, chỉ có mình lựa chọn nó và LÀM nó cho đúng thôi！",
 "Không phải là bạn không đủ giỏi, mà là bạn chưa đặt mình vào môi trường buộc bạn phải giỏi hơn.",
 "Không hứa phải thành công. Nhưng hứa phải cố gắng.",
 "Hãy van xin bản thân ráng thêm chút nữa. Vì làm gì còn bản nháp nào để xé nữa đâu.",
 "Hiện tại chưa đủ giỏi cũng đừng có ý định sống tầm thường.",
 "Nếu đã là con đường của bạn, bạn phải tự bước đi. Người khác có thể đi cùng, nhưng không ai có thể bước đi thay bạn.",
 "Muốn sánh đôi với người ta, thì trước tiên phải đứng ngang hàng.",
"Bạn phải liều mạng với cuộc đời này vài năm, một là bị tiêu diệt, hai là sẽ tỏa sáng như một định mệnh.",
 "Con đường mình chọn, có quỳ cũng phải đi cho hết.",
 "Một bước đi sai, vạn lối tắt. Đạp đổ nguyên tắc, vạn lối đi.",
 "Việc của bạn là trở nên xuất sắc, còn người xứng đáng ông trời đã chuẩn bị sẵn.",
 "Chính vì cậu có khả năng vượt qua nên thử thách này mới xuất hiện.",
 "You’ve got the brains, you can study the plan, u can make your dreams come true. WHY NOT YOU?",
 "Chỉ cần bạn đứng hạng nhất 1 lần. Tôi chắc chắn bạn sẽ không bao giờ muốn rời khỏi vị trí đó.",
 "Sự đau đớn của tri thức sẽ khiến bạn thêm giỏi giang, hạnh phúc hơn.",
 "Hãy can đảm làm những điều khiến bạn sợ hãi, vì bạn sẽ nhận ra rằng chẳng có gi đáng sợ cả.",
 "Những gì chờ đợi bạn ở phía trước, nhất định sẽ tốt đẹp hơn những gì bạn đã bỏ lại phía sau.",
 "Trở thành phiên bản tốt nhất của chính mình đồng nghĩa với việc phải nói lời tạm biệt với rất nhiều người.",
 "Tập hài lòng với những thứ mình đang có và học từ bỏ những thứ trời không cho.",
 "Ai cũng có một con đường riêng để đi, sao phải so sánh với người khác làm gì?",
 "Đi chậm cũng được, đi nhanh cũng được, không dừng lại là được.",
 "Đừng để lạc đường, giữ ấm cho bản thân.",
 "It’s never too late to set a new goal.",
 "Hãy nỗ lực hết mình rồi đứng ngang hàng với người không ai ngờ tới.",
 "Bạn phải trở thành dáng vẻ như chính mình tưởng tượng ra.",
 "Việc của bạn là học lên. Cứ tin rằng 'Gió tầng nào gặp mây tầng đó'. Đừng vì chút rung động tuổi trẻ mà phá nát tương lai rực rỡ.",
 "Đừng để việc học của bạn trở thành ấm nước mãi không sôi.",
 "Không ai thành công nhờ may mắn kéo dài cả đời. Họ thành công vì họ không bỏ cuộc.",
 "Càng sợ, càng phải làm. Càng khó, càng phải cố.",
 "Đặt mục tiêu ở tận mặt trăng, để khi rơi xuống cũng ngã giữa những vì sao.",
 "Bạn nhất định phải nỗ lực.",
 "Trăng khuyết rồi lại tròn, bóng tối qua đi, ánh sáng lại đong đầy.",
 "Muốn ngẩn đầu lên nhìn đời thì trước hết phải cuối đầu nhìn sách.",
 "Để trở nên xuất sắc- hãy trở nên thoải mái với sự không thoải mái. Vì những điều tuyệt vời sẽ không bao giờ đến từ những vùng không an toàn.",
 "Sợ thất bại là bản năng nhưng dám bước tiếp là bản lĩnh.",
 "Người biết kiên trì với tri thức chính là người đang đi đúng hướng tới thành công.",
 "Nếu lúc này bạn ngủ bạn sẽ có một giấc mơ, nhưng lúc này nếu học bạn sẽ giải thích được ước mơ.",
 "Không nỗ lực, đừng mơ mộng.",
 "Áp lực là đặc quyền của người đang cố gắng để trở nên giỏi hơn.",]


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