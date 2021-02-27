Auctions = {
  init: async () => {
    console.log('Auctions init')
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    Auctions.appendAuctions(accounts[0])
  },

  appendAuctions: (account) => {
    App.contracts.NFTDutchAuction.deployed().then((instance) => {
      // get all events
      const allContractEvents = instance.allEvents({fromBlock: 0, toBlock: 'latest'})
      allContractEvents.get((error, data) => {
        // loop through all events
        data.forEach((eventData) => {
          const args = eventData.args
          const auctionId = args.auctionId.toNumber()
          const   tokenId = args.tokenId.toNumber()

          // eventData.event: AuctionCreated, AuctionCancelled, AuctionSuccessful
          if (eventData.event == 'AuctionSuccessful' || eventData.event == 'AuctionCancelled') {
            const auctionDisplayed = $('#auctionsRow').find(`.panel-body[data-auction-id=${auctionId}]`)
            // remove auction
            console.log(`removing auction ${auctionId } (NFT ${tokenId}) [${eventData.event}]`)
            auctionDisplayed.parent().parent().remove()
          } else {
            // eventData.event == 'AuctionCreated'
            console.log(`found auction ${auctionId } (NFT ${tokenId}) [${eventData.event}]`)

            const startingPrice = args.startingPrice.toNumber()
            const   endingPrice = args.endingPrice.toNumber()
            const      duration = args.duration.toNumber()

            // add thousands seperators
            const formattedNumber = tokenId.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            // prepare the template to display the auction
            const auctionTemplate = $('#auctionTemplate')
            auctionTemplate.find('.panel-body').attr('data-auction-id', auctionId)
            auctionTemplate.find('.panel-body .number').text(formattedNumber)
            auctionTemplate.find('.panel-body .number').attr('data-token-id', tokenId)
            auctionTemplate.find('.panel-body .price-start').text(web3.fromWei(startingPrice, 'ether'))
            auctionTemplate.find('.panel-body .price-end').text(web3.fromWei(endingPrice, 'ether'))
            auctionTemplate.find('.panel-body .duration').text((duration / 60))
            // append the tempalte to the dom
            //console.log('appending auction ' + auctionId)
            $('#auctionsRow').append(auctionTemplate.html())
          }
        });
        // fit textsize of large numbers
        fitty('#auctionsRow .number', {
          minSize: 20,
          maxSize: 60
        })
      })

      return instance
    }).catch((err) => {
      console.error(err.message)
    });
    return Auctions.bindEvents()
  },

  bindEvents: () => {
    // add 'number to sell' to modal
    $(document).on('click', '#auctionsRow .view-auction', function(event) {
      const parent = $(this).parent().parent().parent(); // TODO: ugh
      const formattedNumber = parent.find('.number').text()
      const auctionId = parent.find('.panel-body').attr('data-auction-id')
      const tokenToSell = parent.find('.number').attr('data-token-id')
      const data = {
        auctionId: auctionId,
        tokenId: tokenToSell,
        startingPrice: parent.find('.price-start').text(),
        endingPrice: parent.find('.price-end').text(),
        duration: parent.find('.duration').text()
      }
      $('#viewAuctionModal .panel-body').attr('data-auction-id', auctionId)
      $('#viewAuctionModal .number').attr('data-token-id', tokenToSell)
      $('#viewAuctionModal .number').text(formattedNumber)
      $('#viewAuctionModal .price-start').text(data.startingPrice)
      $('#viewAuctionModal .price-end').text(data.endingPrice)
      $('#viewAuctionModal .duration').text(data.duration)
      // https://getbootstrap.com/docs/4.1/components/modal/
      $('#viewAuctionModal').on('shown.bs.modal', (event) => {
        // fit textsize of large numbers in modal
        fitty('#viewAuctionModal .number', {
          minSize: 20,
          maxSize: 60
        })
      })

      App.contracts.NFTDutchAuction.deployed().then((instance) => {
        // get current price
        return instance.getCurrentPriceByAuctionId(auctionId)
      }).then((o) => {
        // convert bigNumber to int
        const currentPrice = o.toNumber()
        // convert wei to ether
        data.currentPrice = web3.fromWei(currentPrice, 'ether')
        $('#viewAuctionModal .price-current').text('~ ' + (Math.round(data.currentPrice * 100) / 100))

        if (data.currentPrice == data.endingPrice) {
          $('#buyButton').hide()
          $('.btn-success.disabled').show()
        } else {
          // TODO:
          // check if auction has been cancelled or finished
          // - need to get events and check if auction with auctionId is amoung them
          $('#buyButton').show()
          $('.btn-success.disabled').hide()
        }

        // create the chart
        Auctions.constructChart(data)
      }).catch((err) => {
        console.error(err.message)
      })

    })
  },

  constructChart: (data) => {
    // generate datasets
    let datasets = { time: [], price: [] }

    // calculate step to reduced data granularity
    // (step for time/minutes)
    let step;
    if (data.duration <= 100) {
      step = 1;
    } else if (data.duration <= 1000) {
      step = 10;
    } else if (data.duration <= 10000) {
      step = 100;
    } else if (data.duration <= 100000) {
      step = 1000;
    } else if (data.duration <= 1000000) {
      step = 10000;
    } else {
      step = 100000;
    }

    let i = 0;
    let helper = data.duration;
    while (helper > 0) {
      datasets.time[i] = helper;
      i++;
      helper -= step;
    }
    /*
    console.log('datasets.time:');
    console.log(datasets.time);
    console.log('datasets.time.length: ' + datasets.time.length);
    console.log('data.duration:');
    console.log(data.duration);
    */

    const priceRange = data.startingPrice - data.endingPrice;
    // calculate step for price
    step = priceRange / datasets.time.length;

    i = 0
    helper = data.startingPrice
    while (helper >= data.endingPrice) {
      let price = data.startingPrice - (step * i)
      // round number down to two decimal places
      price = Math.round(price * 100) / 100
      datasets.price[i] = price
      helper -= step
      i++
    }
    /*
    console.log('datasets.price.length: ' + datasets.price.length);
    console.log('datasets.price:');
    console.log(datasets.price);
    */

    // add first & final values
    datasets.time.push(0)
    datasets.price.push(data.endingPrice)

    // construct chart
    // https://github.com/chartjs/chartjs-plugin-annotation
    const annotations = [data.currentPrice].map((value, index) => {
      return {
        type: 'line',
        id: 'vline' + index,
        mode: 'horizontal',
        scaleID: 'y-axis-time',
        value: value,
        borderColor: '#8a2be2',
        borderWidth: 1,
        label: {
          enabled: true,
          position: 'right',
          content: '~ ' + Math.round(value * 100) / 100 + ' ETH'
        }
      }
    })

    let options = {
      type: 'line',
      data: {
        labels: datasets.time,
        datasets: [{
          label: 'Price [ETH]',
          data: datasets.price,
          type: 'line',
          pointRadius: 0,
          fill: true,
          lineTension: 0,
          borderWidth: 2,
          backgroundColor: ['rgba(75, 192, 192, 0.2)'],
          borderColor: ['rgba(75, 192, 192, 1)']
        }],
      },
      options: {
        responsive: true,
        annotation: {
          drawTime: 'afterDatasetsDraw',
          annotations,
        },
        scales: {
          xAxes: [{
            id: 'x-axis-price',
            scaleLabel: {
              display: true,
              labelString: 'Time [Minutes]'
            },
          }],
          yAxes: [{
            id: 'y-axis-time',
            scaleLabel: {
              display: true,
              labelString: 'Price [ETH]'
            },
          }]
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: ({datasetIndex, yLabel}, {datasets}) => {
              return `~ ${yLabel} ETH`
            }
          }
        }
      }
    }
    // build chart
    const chartId = document.getElementById('chart').getContext('2d')
    const chart = new Chart(chartId, options)
    // when closing modal reset chart to avoid displaying errors
    $('#viewAuctionModal').on('hidden.bs.modal', () => {
      chart.destroy()
    });
  }
}

$(function() {
  $(window).load(() => {
    Auctions.init()
  });
});
